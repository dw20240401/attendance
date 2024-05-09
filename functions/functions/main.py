from firebase_functions import https_fn, options
from firebase_admin import initialize_app
import requests
from pathlib import Path

initialize_app()
options.set_global_options(region=options.SupportedRegion.ASIA_NORTHEAST1)
options.MemoryOption.GB_1

@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"])
)
def setTimerecord(req: https_fn.Request) -> https_fn.Response:
    # パラメータ
    reqJson = req.get_json(silent=True)
    
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

    # return https_fn.Response(response, status=200, headers=resHeaders)
    return https_fn.Response(response)

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
