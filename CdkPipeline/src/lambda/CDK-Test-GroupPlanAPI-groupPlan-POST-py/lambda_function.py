import json
import boto3
import uuid
from boto3.dynamodb.conditions import Key, Attr
import datetime


dynamodb=boto3.resource('dynamodb')
tableName="GroupPlan"
table_fields=['bpId','groupPlanName','contactPersonName','defaultDiscountValidityPeriod','contactPersonEmailId','contactPersonPhoneNo','defaultDiscountType','groupPlanDesc','groupPlanType','companyName','privateGroupFields','companyEmailDomain','groupSize','discountValue','discountType','discountExceptions','groupStatus','planValidityStartDate','defaultDiscountStartDate','offerBusinessRule','groupPlanStatus','applicableItems']

def lambda_handler(event, context):
    # localMerchantId=event.get('lMID')
    table=dynamodb.Table(tableName)
    item_dto=create_Item_dto(event)
    output=table.put_item(Item=item_dto)
    return {
            "success": True,
            "message": "GroupPlan created",
            "statusCode": output.get('ResponseMetadata').get('HTTPStatusCode'),
            "responseData":item_dto
            }

    
def create_Item_dto(event):
    
    create_item_dto={}
        
    for repfield in table_fields:
        create_item_dto[repfield]=event.get(repfield,None)
    create_item_dto['id']=str(uuid.uuid4())
    create_item_dto['groupPlanId']=event.get('cityCode')+str(uuid.uuid4().hex[:5])
    create_item_dto['groupPlanStatus']= "Active"
    create_item_dto['isActive']= 1
    #create_item_dto['creationTimeStamp']= datetime.datetime.now()
    
    
    return create_item_dto
    