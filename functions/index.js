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
    const userId = data.text;
    const ref = admin.database().ref('/Trip/'+ userId);
    ref.once('value').then(snap => {
        snap.forEach(element => {
            element.ref.child('wasDeleted').set(true);
        });
    }).then(() => {
        return {text: 'success'}
    })
});


exports.testReset = functions.https.onRequest((req, res) => {
    const userId = req.query.text;
    const ref = admin.database().ref('/Trip/'+ userId);
    ref.once('value', function(snap) {
        snap.forEach(function (childSnap){
            console.log('user', childSnap.val());
        }).then(() => {
            return {text: 'success'}
        });
    });
});