/*

challengeCtrl.js
configuring routes for challengeRouter

 */

module.exports = function (db) {
  return {
    create: function (req, res) {
      // console Log
      console.log('create challenge: ', req.user, req.body);
      // pull out data
      var challenger = req.user;
      var challenged = req.body.challenged;
      var title = req.body.title;
      var description = req.body.description;
      var type = req.body.type;
      var charityAmount = req.body.charityAmount;
      var issuedDate = new Date();
      var expiresDate = new Date();
      // expires in 24 hours from issue date
      expiresDate.setDate(expiresDate.getDate() + 1);

      // query for challenger
      db.User.findOne({
          where: {
            email: challenger.email
          }
        })
        .then(function (challenger) {
          // query for challenged
          db.User.findOne({
            where: {
              email: challenged.email
            }
          }).then(function (challenged) {
            // create challenge
            db.Challenge.create({
              title: title,
              type: type,
              description: description,
              charityAmount: charityAmount,
              issuedDate: issuedDate,
              expiresDate: expiresDate,
            }).then(function (challenge) {
              // create foreign keys on challenge
              challenger.addImposedChallenge(challenge);
              challenged.addMyChallenge(challenge);
              challenge.setChallenger(challenger);
              challenge.setChallenged(challenged);
              // Console Log
              console.log('successfully created challenge');
              res.status(201).end();
            });
          });
        });
    },

    retrieveAll: function (req, res) {
      // console.log('api/challenge retrieving all challenges');
      // query for all challenges
      db.Challenge.findAll({
          attributes: ['id',
            'title',
            'type',
            'description',
            'charityAmount',
            'completed',
            'notCompleted',
            'likes',
            'expiresDate',
            'issuedDate',
            'completedDate'
          ],
          include: [{
            model: db.User,
            as: 'Challenger',
            attributes: ['id', 'firstName', 'lastName', 'email', 'photoURL']
          }, {
            model: db.User,
            as: 'Challenged',
            attributes: ['id', 'firstName', 'lastName', 'email', 'photoURL']
          }],
          order: 'issuedDate DESC'
        })
        .then(function (challenges) {
          allChallenges = [];
          for (var i = 0; i < challenges.length; i++) {
            allChallenges.push(challenges[i].dataValues);
          }
          res.json(allChallenges);
        });
    },

    update: function (req, res) {
      // console log
      console.log('/api/challenge updating model');
      // pull out necessary data
      var id = req.body.id;
      var updateModel = {
        completed: req.body.completed,
        notCompleted: req.body.notCompleted,
        likes: req.body.likes
      };
      // query for model to update
      db.Challenge.findOne({
        where: {
          id: id
        }
      }).then(function (challenge) {
        challenge.update(updateModel)
          .then(function (challenge) {
            res.status(200).end();
          });
      });
    },

    getMyChallenges: function (req, res) {
      // console log
      console.log('/api/challenge/ retrieving challenges for user: ' + req.user.firstName);
      // pull out data
      var id = req.user.id;
      db.User.find({
        where: {
          id: id
        }
      }).then(function(user) {
        user.getMyChallenges()
        .then(function(challenges) {
          console.log('fetched all challenges for specific user from db');
          res.json(challenges);
        });
      });
    },

    getChallengeByID: function(req, res){
      console.log('PARAMS : ', req.query.id);
      var id = req.query.id;
      db.Challenge.find({
        where: {
          id: id
        }
      })
      .then(function(challenge) {
        console.log('FOUND Challenge : ', challenge);
        res.json({challenge : challenge});
      });
    }

  };
};
