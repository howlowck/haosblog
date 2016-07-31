+++
author = "Hao Luo"
comments = true
date = "2016-01-05T14:51:45-06:00"
draft = false
image = "img/transformers-1.jpg"
menu = ""
share = true
slug = "power-of-transformers"
tags = ["response", "evaluation"]
title = "Power of Transformers (not these robots ↑)"
+++

About a year ago, I was tasked to write an API for a mobile application for the Dean of Students office.  While the main functionalities were finalized, the app's development was still in its infancy.  This means that the API's output and how it would be best-suited for the app's consumption was still very much undefined.

We had to use transformers to separate the API's logic layer from its presentation.

We used a PHP package called [Fractal](http://fractal.thephpleague.com/) to create our API presentation layer.

## The Code
Setting up the code to use our transformer is pretty straight forward:

```PHP
...
protected function getResourceArray(NotifyDTO $dto) {
    $fractal = new Manager();
    $fractal->setSerializer(new BareArraySerializer());
    // using the transformer to create a new fractal item
    $resource = new Item($dto, new NotifyResourceTransformer);
    return $fractal->createData($resource)->toArray();
}
```

Here is the transformer itself:
```PHP
class NotifyResourceTransformer extends Fractal\TransformerAbstract {
...

  public function transform(NotifyDTO $notify) {
    return [
      'id' => (int) $notify->id,
      'updated_at' => $notify->updatedAt->toRfc2822String(),
      'created_at' => $notify->createdAt->toRfc2822String(),
      'client_datetime_utc' => $notify->clientDt->toRfc2822String(),
      'client_timestamp' => $notify->clientDt->timestamp,
      'server_datetime_utc' => $notify->createdAt->toRfc2822String(),
      'token' => $notify->token,
      'origin_lat' => $notify->originLatLong->getLat(),
      'origin_long' => $notify->originLatLong->getLong(),
      'destination_lat' => $notify->destinationLatLong->getLat(),
      'destination_long' => $notify->destinationLatLong->getLong(),
      'countdown_duration' => $notify->countdownSeconds,
      'expired_server_timestamp' => $notify->expiredAt->timestamp,
      'remaining_time' => $this->calcTimeRemaining($notify->expiredAt->timestamp),
      'contact_name' => $notify->contactName,
      'contact_phone' => (string) $notify->contactPhone,
      'battery' => $notify->battery,
      'message' => $notify->message,
      'return_netid' => $notify->returnNetid,
      'initiated_at' => is_null($notify->initiatedAt)
                         ? null: $notify->initiatedAt->toRfc2822String(),
      'notified_at' => is_null($notify->notifiedAt)
                        ? null: $notify->notifiedAt->toRfc2822String(),
      'canceled_at'=> is_null($notify->canceledAt)
                       ? null: $notify->canceledAt->toRfc2822String(),
      'latest_location_id' => $notify->latestLocationId,
		];
	}
...
}
```

Fractal passes the Data Transfer Object (DTO) to the transformer to create an item.  This item is able to be outputted as various formats, ie XML, json, array, etc.

Enabling a transformer to transform an unchangeable data structure to an ever-changing output format proved to be invaluable for us.  When my colleague wanted the date format to change, it was literally one line of change without me worrying if other parts of my API application was needing the older format.
