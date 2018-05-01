const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((req, res) => {
    res.send("Hello From Firebase");
})

exports.setTextToChild = functions.https.onRequest((req, res) => {
    const queryText = req.query.text;
    admin.database().ref('/users').push({text: queryText}).then(snapshot => {
        res.redirect(303, snapshot.ref);
    })
})

var childNodes = ["Business",
    "CustomField",
    "ExpenseCategory",
    "FavoriteTrips",
    "Settings",
    "Trip",
    "Trip-Expenses",
    "TypeRate",
    "Vehicle"]    

exports.resetUserDatabase = functions.https.onCall((data, context) => {
    //Get userId from context
    const userId = data.text;
    console.log('userId', userId)
    //Get childNodeIndex from the childNodes Array
    var childNodeIndex = childNodes.length - 1

    //Checking that the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'You must be authenticated to reset the data.');
    }
    //Pass the childNode name to the recursiveReset
    recursiveResetFunction(childNodes[childNodeIndex])
    function recursiveResetFunction(childNode) {
        const ref = admin.database().ref(childNode + '/' + userId);
        ref.once('value', function (snap) {
            if (childNode == "CustomField" || childNode == "Settings") {
                snap.ref.remove();
            } else {
                snap.forEach(function (childSnap) {
                    childSnap.ref.update({
                        'wasDeleted': true
                    });
                })
            }
        }).then(snapshot => {
            //Recursion Happens
            if (childNodeIndex > 0) {
                childNodeIndex = childNodeIndex - 1;
                return recursiveResetFunction(childNodes[childNodeIndex])
            } else {
                return {
                    "code": "200",
                    "message": "success"
                };
            }
        }).catch((error) => {
            throw new functions.https.HttpsError('unknown', error.message, error);
        });
    }
});

exports.testReset = functions.https.onRequest((req, res) => {
    const userId = req.query.text;
    var childNodeIndex = childNodes.length
    recursiveResetFunction(childNodes[childNodeIndex])
    function recursiveResetFunction(childNode) {
        const ref = admin.database().ref(childNode + '/' + userId);
        ref.once('value', function (snap) {
            if (childNode == "CustomField" || childNode == "Settings") {
                snap.ref.remove();
            } else {
                snap.forEach(function (childSnap) {
                    childSnap.ref.update({
                        'wasDeleted': true
                    });
                })
            }
        }).then(snapshot => {
            if (childNodeIndex > 0) {
                childNodeIndex = childNodeIndex - 1;
                return recursiveResetFunction(childNodes[childNodeIndex])
            } else {
                res.send('success');
            }
        });
    }
});