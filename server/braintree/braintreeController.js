/*

authController.js
configuring routes for authRouter

*/

// load environment variables from .env file
require('dotenv').config({path : __dirname + '/../../.env'});
// promise library to avoid callback hell
var Promise = require('bluebird');
// braintree payment API
var braintree = require('braintree');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.merchantId,
  publicKey: process.env.publicKey,
  privateKey: process.env.privateKey
});

module.exports = {

  generateToken: function (req, res) {
    // console log
    console.log('Generate braintree client token and send back to user...');
    // generate token
    gateway.clientToken.generate({
      // customerId: '69633792'
    }, function (err, response) {
      // propogate token to client
      res.send(response.clientToken);
    });
  },

  checkout: function(req, res){
    // console log
    console.log('Receive payment method nonce from client : ', req.body.payment_method_nonce, ' and generate a transaction...');
    // get payment nonce
    var nonce = req.body.payment_method_nonce;
    var payment = req.body.payment;
    // create transaction
    gateway.transaction.sale({
      amount : payment.amount,
      paymentMethodNonce: nonce
    }, function(err, result){
      if (err) {
        console.log('error creating transaction...', err);
      }
      // propogate result to client
      res.json(result);
    });
  },

  /*
    Create a new customer with a payment method
    (First time checkout)
  */
  createCustomer: function(req, res){
    // console log
    console.log('create new customer... ', req.body.user, ' with nonce : ', req.body.payment_method_nonce);
    // get user object
    var user = req.body.user;
    var nonce = req.body.payment_method_nonce;
    // create new customer with payment method
    gateway.customer.create({
      firstName: user.fname,
      lastName: user.lname,
      // company: "Braintree",
      email: user.email,
      paymentMethodNonce: nonce
    }, function (err, result) {
      if (err) {
        console.log('error creating customer : ', err);
      }
      // propogate result to client
      res.json(result);
      // result.success; // true
      // result.customer.id; // e.g 160923
      // result.customer.paymentMethods[0].token; // e.g f28wm
    });

  },

  /*
    1:1 model of customer to credit card
  */  
  updateCustomer: function(req, res){
    // console log
    console.log('update customer...');
    // get user object
    var user = req.body.user;
    gateway.customer.find(user.customer.id, function (err, customer) {
      var token = customer.creditCards[0].token;
    });
  } 

};
