# GYROPHARE V1

#### Architecture  

Le point d'entrée unique est le endpoint API Gateway , attaqué en HTTP par ServiceNow.  
Celui-ci déclenche alors la lambda qui se charge de mettre à jour le **shadow** du raspberry pi qui pilote le gyrophare dans AWS IoT. 
 
#### Thing shadow

Un thing est la représentation d'un device sur le cloud dans AWS IoT.  
Le shadow est l'état d'un 'thing'.    
Il a trois propriétés :
reported | état actuel du device
-------- | ---------------------
desired  |état que l'on souhaite donner au device
delta    |delta entre l'état reported et desired



Le raspberry pi souscrit au topic "shadow" de sa représentation sur AWS IoT  via le protocole MQTT , ce qui fait que lorsqu'une modification est faite , il est immédiatement notitifié .  
Si dans le message qu'il reçoit il y a un delta , il se mettra à jour en conséquence et passera de l'état ```flashing:true``` à ```flashing:false``` par exemple  

#### AWS IoT button

Il y a aussi un AWS IoT button qui peut piloter le gyrophare via une deuxième lambda de deux façon :

simple clique | mise à jour du shadow pour éteinde le gyrophare
-------- | ---------------------
appui long  | test d'allumage du gyrophare

#### Association Raspberry Pi / AWS IoT button

A la création d'un thing sur AWS IoT , il faut lui associer le type *gyrophare* , qui ajoute le tag associateButton ou on renseigne le numéro de série de l'IoT button associé , pour que celui soit accessible aux lambdas .







