const express = require('express');
const https = require('https');
const Note = require('./../models/Notes');
const PaytmChecksum = require('./PaytmChecksum');
const { ensureAuth } = require('./../middleware/auth');
const Purchase = require('./../models/Purchase');
const checksum_lib = require('./checksum/checksum');
const port = 5000;
const router = express.Router();

function makeid(length) {
  var result           = '';
  var characters       = '0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.post('/', ensureAuth, async (req, res) => {
  const note = await Note.findById(req.body.productID);

  const params = {};

  params['MID'] = process.env.PAYTM_MID;
  params['WEBSITE'] = 'WEBSTAGING';
  params['CHANNEL_ID'] = 'WEB';
  params['INDUSTRY_TYPE_ID'] = 'Retail';
  params['ORDER_ID'] = `ORD${makeid(15)}`;
  params['CUST_ID'] = `CUST${req.user.googleId}`;
  params['TXN_AMOUNT'] = note.price.toString();
  params[
    'CALLBACK_URL'
  ] = `${req.protocol}://${req.hostname}:5000/payment/callback/${req.body.productID}`;
  params['EMAIL'] = req.body.email;
  params['MOBILE_NO'] = req.body.phone;

  // let params = {};
  // params['MID'] = 'NaTulN90516035402899'
  // params['WEBSITE'] = 'WEBSTAGING'
  // params['CHANNEL_ID'] = 'WEB'
  // params['INDUSTRY_TYPE_ID'] = 'Retail'
  // params['ORDER_ID'] = 'ORD0001'
  // params['CUST_ID']  = 'CUST0011'
  // params['TXN_AMOUNT'] = '100'
  // params['CALLBACK_URL'] = 'http://localhost:5000/note/'
  // params['EMAIL'] = 'xyz@gmail.com'
  // params['MOBILE_NO'] = '6396210135'
  // 

  console.log(params);

  checksum_lib.genchecksum(params, process.env.PAYTM_MKEY, function (
    err,
    checksum
  ) {
    let txn_url = 'https://securegw-stage.paytm.in/order/process';

    let form_fields = '';

    for (x in params) {
      form_fields += `<input type='hidden' name='${x}' value='${params[x]}'>`;
    }

    form_fields += `<input type='hidden' name='CHECKSUMHASH' value='${checksum}'>`;

    let html = `
        <html><body>

        <center><h1>Please wait! Dont refresh the page. </h1> </center>
        
        <form method = "POST" action='${txn_url}' name = "f1"> ${form_fields} </form> 
        <script type = 'text/javascript'> document.f1.submit() </script>
        
        </body> </html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
  });
});

router.post('/callback/:id', ensureAuth, (req, res) => {
  let paytmChecksum = '';
  const received_data = req.body;
  const paytmParams = {};
  for (let key in received_data) {
    if (key == 'CHECKSUMHASH') paytmChecksum = received_data[key];
    else paytmParams[key] = received_data[key];
  }

  const isValidChecksum = checksum_lib.verifychecksum(
    paytmParams,
    process.env.PAYTM_MKEY,
    paytmChecksum
  );

  if (isValidChecksum) {
    console.log('Checksum Matched');

    const paytmParams = {};


    paytmParams.body = {
      mid: process.env.PAYTM_MID,

      orderId: received_data['ORDERID'],
    };


    PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      process.env.PAYTM_MKEY
    ).then(function (checksum) {
      paytmParams.head = {
        /* put generated checksum value here */
        signature: checksum,
      };

      /* prepare JSON string for request */
      var post_data = JSON.stringify(paytmParams);

      var options = {
        /* for Staging */
        hostname: 'securegw-stage.paytm.in',

        /* for Production */
        // hostname: 'securegw.paytm.in',

        port: 443,
        path: '/v3/order/status',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': post_data.length,
        },
      };

      // Set up the request
      var response = '';
      var post_req = https.request(options, function (post_res) {
        post_res.on('data', function (chunk) {
          response += chunk;
        });

        post_res.on('end', async function () {
          const result = JSON.parse(response);
          console.log(result)

        //  res.json(result);

          if (result.body.resultInfo.resultStatus == 'TXN_SUCCESS') {
            // crete an purchase item

            const information = {
              user: req.user.googleId,
              note: req.params.id,
            };

            const purchase = await Purchase.create(information);

            // redirect to /note/:id
           res.redirect(`http://localhost:5000/note/${req.params.id}`);

            // redirect to note
          } else {
            
          //  res.message = "Payment Failure. Try Again."
             const message = "Payment Failure. Try Again.";
            res.redirect(`http://localhost:5000/note/buy/${req.params.id}?message=${message}`);
          }
        });
      });

      // post the data
      post_req.write(post_data);
      post_req.end();
    });
  } else {
    console.log('Checksum Mismatched.');
  }
});

module.exports = router;
