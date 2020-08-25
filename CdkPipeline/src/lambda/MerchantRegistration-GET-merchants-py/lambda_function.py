import json
import boto3
import uuid
from boto3.dynamodb.conditions import Key, Attr
import random
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = "BPprofile"
table_fields = ['id', 'bpId', 'businessName', 'address', 'city', 'zipCode', 'state', 'country', 'website',
                'numOfPhysicalLocations', 'businessType', 'businessSubType', 'profileImage', 'password',
                'primaryPhoneNo', 'primaryEmailID', 'firstName', 'lastName',
                'freeTrailStarted', 'freeTrailStartTS', 'planid', 'paidPlan']
groupPlan = 'GroupPlan'
subscriptionMaster = 'SubscriptionMaster'
merchantOffers = 'MerchantOffer'


# plan_details_fields=['startDate','billingcycle','stripeFreeTrial']

def lambda_handler(event, context):
    table = dynamodb.Table(table_name)
    index = 'city-bpId-index'
    city = event.get('city')
    business_type = event.get('businessType')
    response = table.query(
        IndexName=index,
        KeyConditionExpression=Key('city').eq(city),
        FilterExpression=Attr('businessType').eq(business_type)
    )
    respnse_dto = map_response(response.get("Items"))
    return {
        "success": True,
        "message": "Service Names Available",
        "statusCode": 200,
        "responseData": respnse_dto
    }


def map_response(items):
    response_dto = []
    groupPlanTable = dynamodb.Table(groupPlan)
    subscriptionMasterTable = dynamodb.Table(subscriptionMaster)
    merchantOffersTable = dynamodb.Table(merchantOffers)

    for item in items:
        reposeItem = {}
        for repfield in table_fields:
            reposeItem[repfield] = item.get(repfield, None);
        reposeItem['ratings'] = json.loads(json.dumps(round(random.uniform(4,5), 1)), parse_float=Decimal)
        merchantGroupPlans = groupPlanTable.query(
                IndexName='bpId-index',
                KeyConditionExpression=Key('bpId').eq(reposeItem.get('bpId')),
                FilterExpression=Attr('groupPlanStatus').eq('Active')
            )
        reposeItem['groupPlans'] = len(merchantGroupPlans.get('Items'))
        subscriptions = subscriptionMasterTable.query(
                IndexName='bpId-index',
                KeyConditionExpression=Key('bpId').eq(reposeItem.get('bpId')),
                FilterExpression=Attr('isActive').eq(1)
            )
        reposeItem['subscriptions'] = len(subscriptions.get('Items'))
        offers = merchantOffersTable.query(
                IndexName='lMID-merchant-offer-index',
                KeyConditionExpression=Key('lMID').eq(reposeItem.get('bpId')),
                FilterExpression=Attr('isActive').eq(1)
            )
        reposeItem['offers'] = len(offers.get('Items'))
        
        response_dto.append(reposeItem)
        
    
    return response_dto





