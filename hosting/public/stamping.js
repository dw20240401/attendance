// Firebase 開発環境
// const firebaseConfig = {
//   apiKey: "AIzaSyCL5ftfrlwsjTa4O-DjPqLtJA-t0JHDLoU",
//   authDomain: "attendance-3cf4f.firebaseapp.com",
//   projectId: "attendance-3cf4f",
//   storageBucket: "attendance-3cf4f.appspot.com",
//   messagingSenderId: "442106731625",
//   appId: "1:442106731625:web:a3c7b0f4521bfd88c096f8",
//   measurementId: "G-1PN91D78KW"     
// };

// Firebase 本番環境
const firebaseConfig = {
apiKey: "AIzaSyCsq6W-1iYaTXE-l20FRqGyOJaG_QWI0NQ",
authDomain: "timerecord-ba98d.firebaseapp.com",
projectId: "timerecord-ba98d",
storageBucket: "timerecord-ba98d.appspot.com",
messagingSenderId: "473420527066",
appId: "1:473420527066:web:2dbbf9deea5c0c540b7ce3",
measurementId: "G-K7WLNRDMZ8"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ボタン非活性化
document.getElementById("startWorkBtn").disabled = true;
document.getElementById("endWorkBtn").disabled = true;

// ログイン状態チェック
firebase.auth().onAuthStateChanged(user => {
if (user) {
    // Firesore ユーザマスタから情報取得(New)
    var divisionDocRef = db.collection("users2");
    divisionDocRef.get().then((divisionDocs) => {
    divisionDocs.forEach(divisionDoc => {
        // 部門毎のメンバーから検索
        var membersDocRef = db.collection("users2").doc(divisionDoc.id).collection("members").doc(user.uid);
        membersDocRef.get().then((membersDoc) => {
        if (membersDoc.data() != undefined) {
            var userData = membersDoc.data()
            document.getElementById("userCd").value = userData.user_cd;
            document.getElementById("userName").value = userData.user_name;
            document.getElementById("userUid").value = user.uid;
            document.getElementById("userInfoArea").innerHTML = userData.user_cd + " / " + userData.user_name;
            // Firestore privateから従業員キーを取得
            var userPrivateDocRef = db.collection("users2").doc(divisionDoc.id).collection("members").doc(user.uid).collection("private").doc("freee");
            userPrivateDocRef.get().then((userPrivateDoc) => {
            var userPrivateData = userPrivateDoc.data()
            // Firebase存在チェック
            if (userPrivateData == undefined) {
                alert("Firestore freee情報未登録");
                loginModal.style.display = "block";
            } else {
                document.getElementById("employeeKey").value = userPrivateData.employee_key
                loginModal.style.display = "none";
            }
            }).catch((error) => {
            console.log("Firestore freee情報取得エラー:", error);
            loginModal.style.display = "block";
            alert("Firestore freee情報取得エラー");
            });
        } 
        }).catch((error) => {
        console.log("Firestore ユーザ情報取得エラー:", error);
        loginModal.style.display = "block";
        alert("Firestore ユーザ情報取得エラー");
        });
    });
    }).catch((error) => {
        console.log("Firestore ユーザ情報取得エラー:", error);
        loginModal.style.display = "block";
        alert("Firestore ユーザ情報取得エラー");
    });

    // // Firestoreからユーザ情報を取得
    // var userDocRef = db.collection("users").doc(user.uid);
    // userDocRef.get().then((userDoc) => {
    //   // Firesotre存在チェック
    //   if (userDoc.data() === undefined) {
    //     alert("Firestore未登録");
    //     loginModal.style.display = "block";
    //   } else {
    //     var userData = userDoc.data()
    //     console.log(userData);
    //     document.getElementById("userCd").value = userData.user_cd;
    //     document.getElementById("userName").value = userData.user_name;
    //     document.getElementById("userInfoArea").innerHTML = userData.user_cd + " / " + userData.user_name;
    //     // Firestore privateから従業員キーを取得
    //     var userPrivateDocRef = db.collection("users").doc(user.uid).collection("private").doc("freee");
    //     userPrivateDocRef.get().then((userPrivateDoc) => {
    //       var userPrivateData = userPrivateDoc.data()
    //       console.log(userPrivateData);
    //       // Firebase存在チェック
    //       if (userPrivateData == undefined) {
    //         alert("Firestore freee情報未登録");
    //         loginModal.style.display = "block";
    //       } else {
    //         document.getElementById("employeeKey").value = userPrivateData.employee_key
    //         loginModal.style.display = "none";
    //       }
    //     }).catch((error) => {
    //       console.log("Firestore freee情報取得エラー:", error);
    //       loginModal.style.display = "block";
    //       alert("Firestore freee情報取得エラー");
    //     });
    //   }
    // }).catch((error) => {
    //   console.log("Firestore ユーザ情報取得エラー:", error);
    //   loginModal.style.display = "block";
    //   alert("Firestore ユーザ情報取得エラー");
    // });
} else {
    // 未ログイン
    loginModal.style.display = "block";
}
});

// 緯度経度を取得
var latitude = "";
var longitude = "";
var address = "";

function successCallback(position) {
// 位置情報を利用する処理
console.log("位置情報を利用する処理");
latitude = position.coords.latitude;
longitude = position.coords.longitude

// 緯度経度から住所を取得
var xhr = new XMLHttpRequest();
xhr.open("GET", "https://getaddress-jbvalezpva-an.a.run.app?latitude=" + latitude + "&longitude=" + longitude);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send();
xhr.responseType = "text";
xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
    address = xhr.response;
    console.log(address);
    document.getElementById("nowAddressArea").innerHTML = address;
    document.getElementById("startWorkBtn").disabled = false;
    document.getElementById("endWorkBtn").disabled = false;
    } else {
    console.log(`Error: ${xhr.status}`);
    }
};
}
function errorCallback(error) {
console.log(error);
alert("端末の位置情報利用が許可されていません。");
}

var options = {
timeout: 10000 // 10秒でタイムアウトするように設定する
};
navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

// ISO8601(JST)
function toISOStringWithTimezone(date) {
const pad = function (str) {
    return ('0' + str).slice(-2);
};
const year = (date.getFullYear()).toString();
const month = pad((date.getMonth() + 1).toString());
const day = pad(date.getDate().toString());
const hour = pad(date.getHours().toString());
const min = pad(date.getMinutes().toString());
const sec = pad(date.getSeconds().toString());
const tz = -date.getTimezoneOffset();
const sign = tz >= 0 ? '+' : '-';
const tzHour = pad((tz / 60).toString());
const tzMin = pad((tz % 60).toString());
return `${year}-${month}-${day}T${hour}:${min}:${sec}${sign}${tzHour}:${tzMin}`;
}

// 現在日付表示
function getNowDate() {
var today = new Date();
var year = today.getFullYear();
var month = (today.getMonth()+1).toString().padStart(2, "0");
var week = today.getDay();
var day = today.getDate().toString().padStart(2, "0");
var week_ja= new Array("日","月","火","水","木","金","土");
var msg = year + "/" + month + "/" + day + "(" + week_ja[week] + ")";
document.getElementById("NowDateArea").innerHTML = msg;
}
setInterval('getNowDate()',1000);

// 現在時刻表示
function getNowTime() {
var nowTime = new Date();
var nowHour = nowTime.getHours().toString().padStart(2, "0");
var nowMin  = nowTime.getMinutes().toString().padStart(2, "0");
var nowSec  = nowTime.getSeconds().toString().padStart(2, "0");
var msg = nowHour + ":" + nowMin + ":" + nowSec;
document.getElementById("NowTimeArea").innerHTML = msg;
}
setInterval('getNowTime()',1000);

// ボタン活性化チェック
// function buttonActivityCheck() {
//   if (latitude != "" && longitude != "" && address != "") {
//     document.getElementById("startWorkBtn").disabled = false;
//     document.getElementById("endWorkBtn").disabled = false;
//   }
// }
// setInterval('buttonActivityCheck()',1000);

// ログアウトボタン押下
document.querySelector('#logoutBtn').addEventListener('click', function() {
firebase.auth().signOut().then(() => {
    alert("ログアウトしました。");
}).catch((error) => {
    alert("An error happened.");
});
loginModal.style.display = "block";
});

// ログインモーダル ログインボタン押下
document.querySelector('#loginBtn').addEventListener('click', function() {
var email = document.getElementById("email").value;
var password = document.getElementById("password").value;

// 入力チェック
if (email == "") {
    alert("メールアドレスを入力して下さい。");
    return;
} else if (password == "") {
    alert("パスワードを入力して下さい。");
    return;
}

// Authentication 認証
firebase.auth().signInWithEmailAndPassword(email, password)
.then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    console.log(user);
    console.log(user.uid);

    // Firesore ユーザマスタから情報取得(New)
    var divisionDocRef = db.collection("users2");
    divisionDocRef.get().then((divisionDocs) => {
    divisionDocs.forEach(divisionDoc => {
        // 部門毎のメンバーから検索
        var membersDocRef = db.collection("users2").doc(divisionDoc.id).collection("members").doc(user.uid);
        membersDocRef.get().then((membersDoc) => {
        if (membersDoc.data() != undefined) {
            var userData = membersDoc.data()
            document.getElementById("userCd").value = userData.user_cd;
            document.getElementById("userName").value = userData.user_name;
            document.getElementById("userUid").value = user.uid;
            document.getElementById("userInfoArea").innerHTML = userData.user_cd + " / " + userData.user_name;
            // Firestore privateから従業員キーを取得
            var userPrivateDocRef = db.collection("users2").doc(divisionDoc.id).collection("members").doc(user.uid).collection("private").doc("freee");
            userPrivateDocRef.get().then((userPrivateDoc) => {
            var userPrivateData = userPrivateDoc.data()
            // Firebase存在チェック
            if (userPrivateData == undefined) {
                alert("Firestore freee情報未登録");
                loginModal.style.display = "block";
            } else {
                document.getElementById("employeeKey").value = userPrivateData.employee_key
                loginModal.style.display = "none";
            }
            }).catch((error) => {
            console.log("Firestore freee情報取得エラー:", error);
            loginModal.style.display = "block";
            alert("Firestore freee情報取得エラー");
            });
        } 
        }).catch((error) => {
        console.log("Error getting document:", error);
        });
    });
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

    // // Firestoreからユーザ情報を取得
    // var userDocRef = db.collection("users").doc(user.uid);
    // userDocRef.get().then((userDoc) => {
    //   // Firesotre存在チェック
    //   if (userDoc.data() === undefined) {
    //     alert("Firestore未登録");
    //   } else {
    //     var userData = userDoc.data()
    //     document.getElementById("userCd").value = userData.user_cd;
    //     document.getElementById("userName").value = userData.user_name;
    //     document.getElementById("userInfoArea").innerHTML = userData.user_cd + " / " + userData.user_name;

    //     // Firestore privateから従業員キーを取得
    //     var userPrivateDocRef = db.collection("users").doc(user.uid).collection("private").doc("freee");
    //     userPrivateDocRef.get().then((userPrivateDoc) => {
    //       var userPrivateData = userPrivateDoc.data()
    //       // Firebase存在チェック
    //       if (userPrivateData == undefined) {
    //         alert("Firestore freee情報未登録");
    //         loginModal.style.display = "block";
    //       } else {
    //         document.getElementById("employeeKey").value = userPrivateData.employee_key
    //         loginModal.style.display = "none";
    //       }
    //     }).catch((error) => {
    //       console.log("Firestore freee情報取得エラー:", error);
    //       loginModal.style.display = "block";
    //       alert("Firestore freee情報取得エラー");
    //     });
    //   }
    // }).catch((error) => {
    //   console.log("Error getting document:", error);
    //   alert("Error getting document");
    // });
})
.catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    alert("ログイン出来ません。" + error.message);
});
});

// ログインモーダル パスワード初期化ボタン押下
document.querySelector('#passInitBtn').addEventListener('click', function() {
var email = document.getElementById("email").value;

// 入力チェック
if (email == "") {
    alert("メールアドレスを入力して下さい。");
    return;
}

firebase.auth().sendPasswordResetEmail(email).then(() => {
    alert("パスワードの再設定メールを送信しました。");
}).catch((error) => {
    console.log(error.code);
    console.log(error.message);
    alert("メールアドレスが正しくありません。");
});
});

// 勤務開始ボタン押下
document.querySelector('#startWorkBtn').addEventListener('click', function() {
// 勤務開始・終了ボタン非活性化（連打対策）
document.getElementById("startWorkBtn").disabled = true;
document.getElementById("endWorkBtn").disabled = true;
// 緯度経度が取得できているか
if (latitude == "" || longitude == "" || address == "") {
    alert("現在位置情報が取得できていません。");
    return;
}

// 現在日時
var dateTime = new Date();

// ISO8601
var isoDate = toISOStringWithTimezone(dateTime);

// 現在日付
var year = dateTime.getFullYear().toString().padStart(4, "0");
var month = (dateTime.getMonth()+1).toString().padStart(2, "0");
var day = dateTime.getDate().toString().padStart(2, "0");
var date = year + month + day;

// 現在時刻
var nowHour = dateTime.getHours().toString().padStart(2, "0");
var nowMin  = dateTime.getMinutes().toString().padStart(2, "0");
var nowSec  = dateTime.getSeconds().toString().padStart(2, "0");
var time = nowHour + ":" + nowMin + ":" + nowSec;

// ユーザ情報
var userCd = document.getElementById("userCd");
var userName = document.getElementById("userName");
var employeeKey = document.getElementById("employeeKey");
var userUid = document.getElementById("userUid");

// 勤務場所
// var spaceList = document.getElementById("space");
// var num = spaceList.selectedIndex;
// var space = spaceList.options[num].innerText;

// freee勤怠登録
var json = JSON.stringify({
    "employeeKey": employeeKey.value,
    "date": year + "-" + month + "-" + day,
    "time": isoDate,
    "code": "1",
    "latitude": latitude,
    "longitude": longitude
})

var xhr = new XMLHttpRequest();
xhr.open("POST", "https://settimerecord-jbvalezpva-an.a.run.app");
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(json);
xhr.responseType = "json";
var data = "";
xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
    data = xhr.response;
    console.log(data);
    if ("errors" in data) {
        console.log(data);
        alert("freee勤怠の打刻登録に失敗しました。");
        document.getElementById("startWorkBtn").disabled = false;
        document.getElementById("endWorkBtn").disabled = false;
    } else {
        // 勤怠情報登録・更新（新）
        var attendanceDocRef = db.collection("attendance2").doc(userUid.value)
        attendanceDocRef.get().then((attendanceDoc) => {
        // ユーザUIDが存在しない場合、ドキュメントID追加
        if (!attendanceDoc.exists) {
            attendanceDocRef.set({
            user_cd: userCd.value,
            user_name: userName.value,
            }).catch((error) => {
            console.log(error);
            alert("Firestoreの取得に失敗しました。");
            document.getElementById("startWorkBtn").disabled = false;
            document.getElementById("endWorkBtn").disabled = false;
            return;
            });
        }
        // 勤怠開始情報取得
        var timerecordDocRef = db.collection("attendance2").doc(userUid.value).collection("timerecord").doc(date);
        timerecordDocRef.get().then((timerecordDoc) => {
            if (timerecordDoc.exists) {
            // 勤怠情報更新
            db.collection("attendance2").doc(userUid.value).collection("timerecord").doc(date).update({
                start_time: time,
                work_space: address,
            }).then(() => {
                // メッセージモーダル
                document.getElementById("modalMessage").innerHTML = "勤務開始登録しました。";
                messageModal.style.display = "block";
                document.getElementById("startWorkBtn").disabled = false;
                document.getElementById("endWorkBtn").disabled = false;
            }).catch((error) => {
                console.log(error);
                alert("Firestoreの更新に失敗しました。");
                document.getElementById("startWorkBtn").disabled = false;
                document.getElementById("endWorkBtn").disabled = false;
            });
            } else {
            // 勤怠情報登録
            db.collection("attendance2").doc(userUid.value).collection("timerecord").doc(date).set({
                start_time: time,
                work_space: address,
            }).then(() => {
                // メッセージモーダル
                document.getElementById("modalMessage").innerHTML = "勤務開始登録しました。";
                messageModal.style.display = "block";
                document.getElementById("startWorkBtn").disabled = false;
                document.getElementById("endWorkBtn").disabled = false;
            }).catch((error) => {
                console.log(error);
                alert("Firestoreの登録に失敗しました。");
                document.getElementById("startWorkBtn").disabled = false;
                document.getElementById("endWorkBtn").disabled = false;
            });
            }
        }).catch((error) => {
            console.log(error);
            alert("Firestoreの取得に失敗しました。");
            document.getElementById("startWorkBtn").disabled = false;
            document.getElementById("endWorkBtn").disabled = false;
        });
        }).catch((error) => {
        console.log(error);
        alert("Firestoreの取得に失敗しました。");
        document.getElementById("startWorkBtn").disabled = false;
        document.getElementById("endWorkBtn").disabled = false;
        });

        // 勤務開始情報を取得（旧）
        // var docRef = db.collection("attendance").doc(date).collection("users").doc(userUid.value);
        // docRef.get().then((doc) => {
        //   if (doc.exists) {
        //     attendance = doc.data();
        //     // 勤怠情報更新
        //     db.collection("attendance").doc(date).collection("users").doc(userUid.value).update({
        //       user_cd: userCd.value,
        //       user_name: userName.value,
        //       start_time: time,
        //       end_time: "",
        //       work_space: address,
        //       work_space_schedule: "",
        //     })
        //     .then(() => {
        //       // メッセージモーダル
        //       document.getElementById("modalMessage").innerHTML = "勤務開始登録しました。";
        //       messageModal.style.display = "block";
        //     })
        //     .catch((error) => {
        //       console.log(error);
        //       alert("Firestoreの登録に失敗しました。");
        //     });
        //   } else {
        //     // 勤怠情報登録
        //     db.collection("attendance").doc(date).collection("users").doc(userUid.value).set({
        //       user_cd: userCd.value,
        //       user_name: userName.value,
        //       start_time: time,
        //       end_time: "",
        //       work_space: address,
        //       work_space_schedule: "",
        //     })
        //     .then(() => {
        //       // メッセージモーダル
        //       document.getElementById("modalMessage").innerHTML = "勤務開始登録しました。";
        //       messageModal.style.display = "block";
        //     })
        //     .catch((error) => {
        //       console.log(error);
        //       alert("Firestoreの登録に失敗しました。");
        //     });
        //   }
        // }).catch((error) => {
        //     console.log("Error getting document:", error);
        //     alert("Firestoreの登録に失敗しました。");
        // });

        // // FireBase登録
        // db.collection("attendance").doc(date).collection("users").doc(userUid.value).set({
        //   user_cd: userCd.value,
        //   user_name: userName.value,
        //   start_time: time,
        //   end_time: "",
        //   work_space: address,
        //   work_space_schedule: "",
        // })
        // .then(() => {
        //   // メッセージモーダル
        //   document.getElementById("modalMessage").innerHTML = "勤務開始登録しました。";
        //   messageModal.style.display = "block";
        // })
        // .catch((error) => {
        //   console.log(error);
        //   alert("Firestoreの登録に失敗しました。" + error);
        // });
    }
    } else {
    console.log(`Error: ${xhr.status}`);
    alert("freee勤怠の打刻登録に失敗しました。");
    document.getElementById("startWorkBtn").disabled = false;
    document.getElementById("endWorkBtn").disabled = false;
    }
};

// FireBase登録
// db.collection("attendance").doc(date).collection("users").doc(userCd.value).set({
//   user_name: userName.value,
//   start_time: time,
//   end_time: "",
//   work_space: address,
//   work_space_schedule: "",
// })
// .then(() => {
//   // メッセージモーダル
//   document.getElementById("modalMessage").innerHTML = "勤務開始登録しました。";
//   messageModal.style.display = "block";
// })
// .catch((error) => {
//   console.log(error);
//   alert("Firestoreの登録に失敗しました。");
// });
});

// 勤務終了ボタン押下
document.querySelector('#endWorkBtn').addEventListener('click', function() {
// 勤務開始・終了ボタン非活性化（連打対策）
document.getElementById("startWorkBtn").disabled = true;
document.getElementById("endWorkBtn").disabled = true;
// 緯度経度が取得できているか
if (latitude == "" || longitude == "" || address == "") {
    alert("現在位置情報が取得できていません。");
    return;
}

// 現在日時
var dateTime=new Date();

// ISO8601
var isoDate = toISOStringWithTimezone(dateTime);

// 現在日付
var year = dateTime.getFullYear().toString().padStart(4, "0");
var month = (dateTime.getMonth()+1).toString().padStart(2, "0");
var day = dateTime.getDate().toString().padStart(2, "0");
var date = year + month + day;

// 現在時刻
var nowHour = dateTime.getHours().toString().padStart(2, "0");
var nowMin  = dateTime.getMinutes().toString().padStart(2, "0");
var nowSec  = dateTime.getSeconds().toString().padStart(2, "0");
var time = nowHour + ":" + nowMin + ":" + nowSec;

// ユーザ情報
var userCd = document.getElementById("userCd");
var userName = document.getElementById("userName");
var employeeKey = document.getElementById("employeeKey");
var userUid = document.getElementById("userUid");

// 勤務予定場所
// var spaceScheduleList = document.getElementById("space_schedule");
// var num2 = spaceScheduleList.selectedIndex;
// var spaceSchedule = spaceScheduleList.options[num2].innerText;

// freee勤怠登録
var json = JSON.stringify({
    "employeeKey": employeeKey.value,
    "date": year + "-" + month + "-" + day,
    "time": isoDate,
    "code": "2",
    "latitude": latitude,
    "longitude": longitude
})

console.log(json);

var xhr = new XMLHttpRequest();
xhr.open("POST", "https://settimerecord-jbvalezpva-an.a.run.app");
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(json);
xhr.responseType = "json";
xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
    var data = xhr.response;
    console.log(data);
    if ("errors" in data) {
        alert("freee勤怠の打刻登録に失敗しました。");
        document.getElementById("startWorkBtn").disabled = false;
        document.getElementById("endWorkBtn").disabled = false;
    } else {
        // 勤務情報を取得（新）
        var attendanceDocRef = db.collection("attendance2").doc(userUid.value)
        attendanceDocRef.get().then((attendanceDoc) => {
        // ユーザUIDが存在しない場合、ドキュメントID追加
        if (!attendanceDoc.exists) {
            attendanceDocRef.set({
            user_cd: userCd.value,
            user_name: userName.value,
            }).catch((error) => {
            console.log(error);
            alert("Firestoreの取得に失敗しました。");
            document.getElementById("startWorkBtn").disabled = false;
            document.getElementById("endWorkBtn").disabled = false;
            return;
            });
        }
        // 勤怠開始情報取得
        var timerecordDocRef = db.collection("attendance2").doc(userUid.value).collection("timerecord").doc(date);
        timerecordDocRef.get().then((timerecordDoc) => {
            if (timerecordDoc.exists) {
            // 勤怠情報更新
            db.collection("attendance2").doc(userUid.value).collection("timerecord").doc(date).update({
                end_time: time,
                work_space: address
            }).then(() => {
                // メッセージモーダル
                document.getElementById("modalMessage").innerHTML = "勤務終了登録しました。";
                messageModal.style.display = "block";
                document.getElementById("startWorkBtn").disabled = false;
                document.getElementById("endWorkBtn").disabled = false;
            }).catch((error) => {
                console.log(error);
                alert("Firestoreの更新に失敗しました。");
                document.getElementById("startWorkBtn").disabled = false;
                document.getElementById("endWorkBtn").disabled = false;
            });
            } else {
            // 退勤情報登録
            db.collection("attendance2").doc(userUid.value).collection("timerecord").doc(date).set({
                end_time: time,
                work_space: address
            }).then(() => {
                // メッセージモーダル
                document.getElementById("modalMessage").innerHTML = "勤務終了登録しました。";
                messageModal.style.display = "block";
            }).catch((error) => {
                console.log(error);
                alert("Firestoreの登録に失敗しました。");
                document.getElementById("startWorkBtn").disabled = false;
                document.getElementById("endWorkBtn").disabled = false;
            });
            }
        }).catch((error) => {
            console.log(error);
            alert("Firestoreの取得に失敗しました。");
            document.getElementById("startWorkBtn").disabled = false;
            document.getElementById("endWorkBtn").disabled = false;
        });
        }).catch((error) => {
        console.log(error);
        alert("Firestoreの取得に失敗しました。");
        document.getElementById("startWorkBtn").disabled = false;
        document.getElementById("endWorkBtn").disabled = false;
        });

        // 勤務開始情報を取得
        // var docRef = db.collection("attendance").doc(date).collection("users").doc(userUid.value);
        // docRef.get().then((doc) => {
        //   if (doc.exists) {
        //     attendance = doc.data();
        //     console.log("Document data:", attendance.user_name);
        //     // Firestore更新
        //     db.collection("attendance").doc(date).collection("users").doc(userUid.value).update({
        //       end_time: time
        //     })
        //     .then(() => {
        //       // メッセージモーダル
        //       document.getElementById("modalMessage").innerHTML = "勤務終了登録しました。";
        //       messageModal.style.display = "block";
        //     })
        //     .catch((error) => {
        //       console.log(error);
        //       alert("Firestoreの登録に失敗しました。");
        //     });
        //   } else {
        //     console.log("No such document!");
        //     // 退勤情報のみFirestore登録
        //     db.collection("attendance").doc(date).collection("users").doc(userUid.value).set({
        //       user_cd: userCd.value,
        //       user_name: userName.value,
        //       start_time: "",
        //       end_time: time,
        //       work_space: address,
        //     })
        //     .then(() => {
        //       // メッセージモーダル
        //       document.getElementById("modalMessage").innerHTML = "勤務終了登録しました。";
        //       messageModal.style.display = "block";
        //     })
        //     .catch((error) => {
        //       console.log(error);
        //       alert("Firestoreの登録に失敗しました。");
        //     });
        //   }
        // }).catch((error) => {
        //     console.log("Error getting document:", error);
        //     alert("Firestoreの登録に失敗しました。");
        // });
    }
    } else {
    console.log(`Error: ${xhr.status}`);
    alert("freee勤怠の打刻登録に失敗しました。");
    document.getElementById("startWorkBtn").disabled = false;
    document.getElementById("endWorkBtn").disabled = false;
    }
};
});

// メッセージモーダルを閉じる
document.querySelector('#close3').addEventListener('click', function() {
messageModal.style.display = "none";
});
