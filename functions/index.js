const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((req, res) => {
    res.send("Hello From Firebase");
})

exports.resetDBForUser = functions.https.onRequest((req, res) => {
    const queryText = req.query.text;
    admin.database().ref('/users').push({text: queryText}).then(snapshot => {
        res.redirect(303, snapshot.ref);
    })
})

exports.makeUpperCase = functions.database.ref('/users/{pushId}/text').onCreate((snapshot, context) => {
    const original = snapshot.val();
    console.log('Uppercasing', context.params.pushId, original);
    const uppercaseText = original.toUpperCase();
    return snapshot.ref.parent.child('uppercase ').set(uppercaseText);
});     

exports.resetUserDatabase = functions.https.onCall((data, context) => {
    const userId = context.userId;
    const ref = admin.database().ref('/Trip/'+ userId);
    ref.once('value', function(snap) {
        snap.forEach(function(childSnap) {
            childSnap.ref.update({
                'wasDeleted': true
            });
        })
    }).then(() => {
        return {text: 'success'}
    })
});

var childNodes = ["Business",
    "CustomField",
    "ExpenseCategory",
    "FavoriteTrips",
    "Settings",
    "Trip",
    "Trip-Expenses",
    "Typerate",
    "Vehicle"]

exports.testReset = functions.https.onRequest((req, res) => {
    const userId = req.query.text;
    var childNodesCount = childNodes.count;
    function recursiveResetFunction(childNode) {
        const ref = admin.database().ref(childNode + '/' + userId);
        ref.once('value', function (snap) {
            snap.forEach(function (childSnap) {
                if (childNode != "CustomField" || childNode != "Settings") {
                    childSnap.ref.update({
                        'wasDeleted': true
                    });
                } else {
                    childSnap.ref.remove();
                }
            })
        }).then(snapshot => {
            if (childNodesCount > 0) {
                childNodesCount = childNodesCount - 1;
                return recursiveResetFunction(childNodes[childNodesCount-1])
            } else {
                res.send('success');
            }
        });
    }
});