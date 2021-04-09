import * as firebaseAdmin from 'firebase-admin';
import {FuturesOrderModel} from "../model/futuresOrder.model";
import {firebaseSecret} from "./firebase-settings";

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
        projectId: firebaseSecret.project_id,
        clientEmail: firebaseSecret.client_email,
        privateKey: firebaseSecret.private_key
    }),
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

export async function logFutureOrderData(order: FuturesOrderModel) {
    const futuresOrders = db.ref('futureOrders')
    const usersRef = futuresOrders.child(order.orderId.toString());
    await usersRef.set(order);
}
