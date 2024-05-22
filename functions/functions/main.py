from firebase_functions import https_fn, options
from firebase_admin import initialize_app
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import auth
import requests
import datetime
from pathlib import Path

parent = Path(__file__).resolve().parent

# 開発環境
# cred = credentials.Certificate(parent.joinpath("attendance-3cf4f-firebase-adminsdk-xrfcw-42d2d1502e.json"))

# 本番環境
cred = credentials.Certificate(parent.joinpath("timerecord-ba98d-firebase-adminsdk-78ixf-79c9267a95.json"))

initialize_app(cred)

options.set_global_options(region=options.SupportedRegion.ASIA_NORTHEAST1)
options.MemoryOption.GB_1

@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"])
)
def setTimerecord(req: https_fn.Request) -> https_fn.Response:
    try:
        # パラメータ
        reqJson = req.get_json()
        
        # パラメータチェック
        if reqJson is None:
            # return https_fn.Response("No json parameter provided", status=400, headers=resHeaders)
            return https_fn.Response("No json parameter provided")
        
        # 従業員識別キー
        employeeKey = reqJson["employeeKey"]
        # 勤務日
        date = reqJson["date"]
        # 打刻時間
        time = reqJson["time"]
        # 打刻種別コード（1:出勤、2:退勤）
        code = reqJson["code"]
        # 緯度
        latitude = reqJson["latitude"]
        # 経度
        longitude = reqJson["longitude"]

        # KING OF TIME WebAPI
        url = "https://api.kingtime.jp/v1.0/daily-workings/timerecord/" + employeeKey

        headers = {
            "Authorization": "Bearer 07d05c20a9fb41a5b1be08888d2f2654",
            "Content-Type": "application/json"
        }

        data = {
            "date": date,
            "time": time,
            "code": code,
            "latitude": latitude,
            "longitude": longitude
        }

        response = requests.post(url, headers=headers, json=data)
        print(response.status_code)
        print(response.json())

        return https_fn.Response(response)
    
    except Exception as e:
        print("Exception Error")
        print(e)

        return https_fn.Response("error")

@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"])
)
def getAddress(req: https_fn.Request) -> https_fn.Response:
    # パラメータ
    # 緯度
    latitude = req.args["latitude"]
    # 経度
    longitude = req.args["longitude"]

    # 緯度、経度から住所取得
    try:
        res = requests.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + str(latitude) + "," + str(longitude) + "&language=ja&key=AIzaSyDEe_6RBcuQ25PzA2Dl7TE6eSLB_A8BU4k")
        addressData = res.json()
        address = addressData["plus_code"]["compound_code"]
        idx = (addressData["plus_code"]["compound_code"]).find("、")

    except Exception as e:
        address = ""
        idx = 0
    
    return https_fn.Response(address[idx + 1:])

@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"])
)
def setSchedule(req:https_fn.Request) -> https_fn.Response:
    try:
        # パラメータ
        reqJson = req.get_json()

        # Firestore
        db = firestore.client()

        for key in reqJson["datalist"]:
            try:
                email = key["uerid"]
                today = key["today"]
                tomorrow = key["tomorrow"]

                # Firebase Authentication
                user = auth.get_user_by_email(email)
                userUid = user.uid

                # Firebase 勤怠情報取得
                attendanceDocRef = db.collection('attendance2').document(userUid)
                attendanceDoc = attendanceDocRef.get()

                # Firebaseに勤怠情報が登録されている場合は上書く
                if attendanceDoc.exists:
                    attendanceDocRef.update({
                        "today": today,
                        "tomorrow": tomorrow
                    })

                else:
                    attendanceDocRef.set({
                        "today": today,
                        "tomorrow": tomorrow
                    })

            except Exception as e:
                    print(e)

        return https_fn.Response("successful")
    
    except Exception as e:
        print(e)
        return https_fn.Response("error")
