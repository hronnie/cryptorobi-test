import * as firebaseAdmin from 'firebase-admin';

const serviceAccount = require('./morecoin-ui-firebase-adminsdk-ienh4-6c03ea4b06.json');

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: 'https://morecoin-ui-default-rtdb.europe-west1.firebasedatabase.app/'
});

const db = firebaseAdmin.database();

export async function getChannelData() {
    let result = null;
    return db.ref('channel').once('value')
        .then(function(snapshot) {
            result = snapshot.val();
            return result;
        }).catch(function(error) {
            console.log(error);
    })

}
