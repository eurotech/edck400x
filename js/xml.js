function toCamelCase(str) {
  var temp = str.toLowerCase()
	return temp.substr(0, 1).toUpperCase() + temp.substring(1)
}

function makeXML(username,clientID,assetName,type,value,channelName){
	var publishTopic = "$EDC/" + username + "/" + clientID + "/ASSET-V1/EXEC/write"
	var XMLData0;
	var requestObject = [
		{
			name: assetName,
			channels: [
				{
					name: channelName,
					type: type.toUpperCase(),
					value: value
				}
			]
		}
	]
	console.log(JSON.stringify(requestObject))
	XMLData0 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
		"<message xmlns=\"http://eurotech.com/edc/2.0\">" +
		"<topic>" + publishTopic + "</topic>" +
		"<payload>" +
		"<body>" +
		btoa(JSON.stringify(requestObject)) +
		"</body>" +
		"</payload>" +
		"</message>";
	console.log('makeXML: ' + XMLData0);

	if(channelName=='LED1'){
		XMLData1=XMLData0;
	}	else if (channelName=='LED2') {
		XMLData2=XMLData0;
	}  else if (channelName=='LED3') {
		XMLData3=XMLData0;
	} else if (channelName=='LED4-RED') {
		XMLData4=XMLData0;
	} else if (channelName=='LED4-GREEN') {
		XMLData5=XMLData0;
	} else if (channelName=='LED4-BLUE') {
		XMLData6=XMLData0;
	}
}

function makeResetXML(username,clientID,assetName,type,value,channelName){
	var publishTopic = "$EDC/" + username + "/" + clientID + "/ASSET-V1/EXEC/write"
	var XMLData0;
	XMLData0 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
		"<message xmlns=\"http://eurotech.com/edc/2.0\">" +
		"<topic>"+ publishTopic + "</topic>" +
		"<payload>" +
		"<body>" +
		btoa(JSON.stringify([
			{
				name: assetName,
				channels: [
					{
						name: channelName,
						type: type.toUpperCase(),
						value: value
					}
				]
			}
		])) +
		"</body>" +
		"</payload>" +
		"</message>";
	XMLReset=XMLData0;
}
