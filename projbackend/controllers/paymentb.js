var braintree = require("braintree");

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "84zhyb9cn8gzgfmf",
  publicKey: "4zx3ny88q535yzwn",
  privateKey: "6ebbb1e88370251023a7f85fe98b7317	"
});

exports.getToken = (req, res) => {
  gateway.clientToken.generate({}, function(err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(response);
    }
  });
};

exports.processPayment = (req, res) => {
  let nonceFromTheClient = req.body.paymentMethodNonce;

  let amountFromTheClient = req.body.amount;
  gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,

      options: {
        submitForSettlement: true
      }
    },
    function(err, result) {
      if (err) {
        res.status(500).json(error);
      } else {
        res.json(result);
      }
    }
  );
};



// var braintree = require("braintree");

// var gateway = braintree.connect({
//   environment: braintree.Environment.Sandbox,
//   merchantId: "useYourMerchantId",
//   publicKey: "useYourPublicKey",
//   privateKey: "useYourPrivateKey"
// });

// exports.getToken = (req, res) => {
//   gateway.clientToken.generate({}, function(err, response) {
//     if (err) {
//       res.status(500).json(err);
//     } else {
//       res.send(response);
//     }
//   });
// };

// exports.processPayment = (req, res) => {
//   let nonceFromTheClient = req.body.paymentMethodNonce;

//   let amountFromTheClient = req.body.amount;
//   gateway.transaction.sale(
//     {
//       amount: amountFromTheClient,
//       paymentMethodNonce: nonceFromTheClient,

//       options: {
//         submitForSettlement: true
//       }
//     },
//     function(err, result) {
//       if (err) {
//         res.status(500).json(error);
//       } else {
//         res.json(result);
//       }
//     }
//   );
// };
