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