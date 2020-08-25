import stripe
import json
import boto3
import uuid
from boto3.dynamodb.conditions import Key, Attr
import botocore.exceptions
import hmac
import hashlib
import base64
import os
#USER_POOL_ID = 'us-east-2_Va0umA5tj'
#CLIENT_ID = '1obluhf8kvstd4s6tch0t3la5q'
CLIENT_SECRET = ''

USER_POOL_ID = os.environ['USER_POOL_ID']
CLIENT_ID = os.environ['CLIENT_ID']
STRIPE_KEY =os.environ['STRIPE_KEY']

dynamodb=boto3.resource('dynamodb')


table_name="BPprofile"
table_id="bpId"
symactic_id_prefix="BPTNR"
table_fields=['businessName','address','city','zipCode','state','country','website','numOfPhysicalLocations','businessType','businessSubType','profileImage','password','primaryPhoneNo','primaryEmailID','firstName','lastName',
'freeTrailStarted','freeTrailStartTS','planid','paidPlan']
plan_details_fields=['startDate','billingcycle','stripeFreeTrial']
stripe.api_key = STRIPE_KEY

def lambda_handler(event, context):
    emailId=event.get('primaryEmailID')
    password=event.get('password')
    phone=event.get('primaryPhoneNo')
    bpId = symactic_id_prefix+str(uuid.uuid4().node)
    resp=register_user_in_cognito(emailId,password,phone, bpId)
    image = event.get('profileImage')
    if(resp.get('error')==True):
        return {
            "error": True,
            "success": False,
            "message": resp.get('message'),
            "statusCode":400,
            "responseData":None
        }
    return save_in_db(event, bpId, image)
    
    
def save_in_db(event, bpId ,image):
    table=dynamodb.Table(table_name)
    item_dto=create_Item_dto(event, bpId, image)
    output=table.put_item(Item=item_dto)
    return {
            "success": 'true',
            "message": "Business Profile created , email-verification is pending",
            "statusCode": output.get('ResponseMetadata').get('HTTPStatusCode'),
            "reponseData":item_dto
    }
   
    
def create_Item_dto(event, bpId, image):
    create_item_dto={}
        
    for repfield in table_fields:
        create_item_dto[repfield]=event.get(repfield,None)
    
    create_item_dto['id']=str(uuid.uuid4())
    create_item_dto['planDetails']=getPlanDetails(event.get('planDetails',{}))
    create_item_dto['profileStatus']='inactive'
    create_item_dto['productid'] = create_stripe_product(bpId, image)

    create_item_dto[table_id]= bpId

    del create_item_dto['password'] 
    return create_item_dto
    
def getPlanDetails(event):
    item_dto = {}
    for repfield in plan_details_fields:
        item_dto[repfield]=event.get(repfield,None)
    return item_dto

def register_user_in_cognito(email,password,phone_number, bpId):    
    client = boto3.client('cognito-idp')    
    try:
        resp = client.sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            Password=password, 
            UserAttributes=[
            {
                'Name': "email",
                'Value': email
            },
            {
                'Name': "phone_number",
                'Value': phone_number
            },
            {
                'Name': "custom:bp_id",
                'Value': bpId
            }

            ],
            ValidationData=[
                {
                    'Name': "email",
                    'Value': email
                },
                {
                    'Name': "phone_number",
                    'Value': phone_number
                },
                {
                    'Name': "custom:bp_id",
                    'Value': bpId
                }
            ])
    except client.exceptions.UsernameExistsException as e:
        return {"error": True, 
              "success": False, 
              "message": "This username already exists", 
              "data": None}    
    except client.exceptions.InvalidPasswordException as e:
        return {"error": True, 
              "success": False, 
              "message": "Password should have Caps,\
                          Special chars, Numbers", 
              "data": None}
    except client.exceptions.UserLambdaValidationException as e:
      return {"error": True, 
              "success": False, 
              "message": "Email already exists", 
              "data": None}
    
    except Exception as e:
        return {"error": True, 
                "success": False, 
                "message": str(e), 
               "data": None}
    
    return {"error": False, 
            "success": True, 
            "message": "Please confirm your signup,check Email for validation code", 
            "data": None
            }
def create_stripe_product(bpId, image):
    try:
        response = stripe.Product.create(name=bpId, images=[image])
        print(response)
        return response.get('id')
    except Exception as e:
        print(e)
        return 'NA'

    