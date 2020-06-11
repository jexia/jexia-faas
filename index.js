const { createInvoice } = require("./createInvoice.js");
const express = require('express')
const { jexiaClient, UMSModule } = require('jexia-sdk-js/node')
var path = require('path');

const app = express()

const ums = new UMSModule(); 
jexiaClient().init({
  projectID: "4debe611-fb9b-4734-949c-6d39bb9ec4ae",
  key: "ef310418-7972-4f3c-b981-c20913416b9c",
  secret: "lQGyKHm13uS/rI5zEV7tOaeuVHSgA7JChKkFeTYdAeJMdLcBcy9rCrD7+ChtU/W7ygztIi85VxCV/BAyI2fFiQ==",
}, ums);


 app.get('/inv/:user_id', function(req, res){
  const user_id = req.params.user_id
  ums.select()
    .where(field => field("id").isEqualTo(user_id))  
    .subscribe(
    records => {
          const invoice = {
            shipping: {
              name: records[0].email,
              address: "1234 Main Street",
              city: "San Francisco",
              state: "CA",
              country: "US",
              postal_code: 94111
            },
            items: [
              {
                item: "TC 100",
                description: "Toner Cartridge",
                quantity: 2,
                amount: 6000
              },
              {
                item: "USB_EXT",
                description: "USB Cable Extender",
                quantity: 1,
                amount: 2000
              }
            ],
            subtotal: 8000,
            paid: 0,
            invoice_nr: 1234
          };
          createInvoice(invoice, "./files/"+user_id+".pdf")
          res.send('<ul>'
            + '<li>Download <a href="/files/'+user_id+'.pdf">'+user_id+'</a>.</li>'
            + '</ul>');
    },
    error => {
      res.send('<h2>Can\'t find such user</h2>');
    });
  
});

// /files/* is accessed via req.params[0]
// but here we name it :file
app.get('/files/:file(*)', function(req, res, next){
  var filePath = path.join(__dirname, 'files', req.params.file);

  res.download(filePath, function (err) {
    if (!err) return; // file sent
    if (err.status !== 404) return next(err); // non-404 error
    // file for download not found
    res.statusCode = 404;
    res.send('Cant find that file, sorry!');
  });
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(4000);
  console.log('Express started on port 4000');
}

