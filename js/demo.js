var led1status = "";
var led2status = "";
var led3status = "";
var led4status = "";
var led4redStatus = "";
var led4greenStatus = "";
var led4blueStatus = "";
var clickLed1 = "";
var clickLed2 = "";
var clickLed3 = "";
var clickLed4 = "";
var clickLed4red = "";
var clickLed4green = "";
var clickLed4blue = "";
window.led3String = "";
window.c3String = "";
window.t5String = "";
window.t6String = "";
window.qcString = "";
var XMLData1 = "";
var XMLData2 = "";
var XMLData3 = "";
var XMLData4 = "";
var XMLData5 = "";
var XMLData6 = "";
var redIsOn = "";
var greenIsOn = "";
var blueIsOn = "";
var readRed = "";
var readGreen = "";
var readBlue = "";
var XMLrule1 = "";
var XMLrule2 = "";
var XMLReset = "";
var apiURL = "https://api-sandbox.everyware-cloud.com/v2/messages/searchByTopic.xml?topic=";
var publishURL = "https://api-sandbox.everyware-cloud.com/v2/devices/sendRequest.xml";
var logoutURL = "https://api-sandbox.everyware-cloud.com/gvds/logout";


// Dashboard parameters
// Ip Address of the Eurotech Device Cloud (EDC) MQTT Broker (WebSockets)
var MQTTBrokerIP = "broker-sandbox.everyware-cloud.com";

// EDC account name
var accountName = "";

// MQTT User Name
var user = "";

// MQTT Password
var password = "";

// APP_ID
var AppId = "";

var assetNameTopic = "";

// Data Topic
var dataTopic = "";

// Gateway Name
var GatewayName = "";


var channelName = "";
var assetFlag = "";
var typedValue = "";


// Initialize Protobuf
var ProtoBuf = dcodeIO.ProtoBuf;
var ByteBuf = dcodeIO.ByteBuffer;
var pbMsg = ProtoBuf.loadProto("package kuradatatypes;option java_package= \"org.eclipse.kura.core.message.protobuf\";option java_outer_classname = \"KuraPayloadProto\";message KuraPayload {message KuraMetric {enum ValueType{DOUBLE = 0;FLOAT = 1;INT64 = 2;INT32 = 3;BOOL = 4;STRING = 5;BYTES = 6;}required string name = 1;required ValueType type = 2;optional double double_value = 3;optional float float_value = 4;optional int64 long_value = 5;optional int32 int_value = 6;optional bool bool_value = 7;optional string string_value = 8;optional bytes bytes_value = 9;}message KuraPosition{required double latitude=1;required double longitude=2;optional double altitude=3;optional double precision=4;optional double heading=5;optional double speed = 6;optional int64 timestamp=7;optional int32 satellites=8;optional int32 status=9;}optional int64 timestamp = 1;optional KuraPosition position  = 2;extensions 3 to 4999;repeated KuraMetric metric=5000;optional bytes body= 5001;}")
        .build("kuradatatypes.KuraPayload");

var client = "";

var timedFunction;
var previousScore = 0;
var currentScore = 0;
var shotsLeft = 0;
var shootingTimeLeft = 0;
var gameTimeLeft = 0;
var luxVal = 0;
var previousEvent = "NOOP";


function WebSocketConnect() {
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.startTrace();
    client.connect({
        userName: user,
        password: password,
        onSuccess: onConnect,
        onFailure: onFailToConnect,
        useSSL: true
    }
    );

    function onConnect() {
        console.log("onConnect");
        var topic = accountName + "/" + GatewayName + "/" + AppId + "/#";
        client.subscribe(topic);
        console.log("Subscribed to topic: " + topic);
    };

    function onFailToConnect(info) {
        console.log("Failed to connect: code=" + info.errorCode + ", msg=" + info.errorMessage);
        window.alert("Fail to connect! Please reload the page.");
    };

    function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
            window.alert("Connection lost! Please reload the page.");
        }
    };

    function onMessageArrived(message) {
        var topic = message.destinationName;
        var topicFragments = topic.split('/');
        //console.log(topicFragments);

        // Get the payload
        var bytes = message.payloadBytes;
        // Check for GZip header
        if (bytes[0] == 31 && bytes[1] == 139 && bytes[2] == 8 && bytes[3] == 0) {
            //if the packet is a GZip buffer, decompress it...

            // Convert the payload to a Base64 string
            var b64 = _arrayBufferToBase64(bytes);
            // Decompress the payload into a string
            var cdecomp = JXG.decompress(b64);
            // Generate a byte array from the decompressed string
            var bytes = new Uint8Array(cdecomp.length);
            for (var i = 0; i < cdecomp.length; ++i) {
                bytes[i] = (cdecomp.charCodeAt(i));
            }
        }

        // Finally decode the packet with Protocol Buffers
        var newMsg = pbMsg.decode(bytes);
        var metrics = newMsg.getMetric();

        for (i = 0; i < metrics.length; i++) {
            var metric = newMsg.getMetric()[i];
            processMetrics(metric);
        }
    }
}
;

function _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[ i ]);
    }
    return window.btoa(binary);
};

function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        var ascii = binary_string.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes.buffer;
};



function doDemo(username, usrPassword, clientID, assetName) {
    user = username;
    accountName = username;
    password = usrPassword;
    GatewayName = clientID;
    AppId = 'W1/A1/' + assetName;
    client = new Paho.MQTT.Client(MQTTBrokerIP, 443, "ClientDashboard-" + GatewayName);

    WebSocketConnect();

    //LED 1
    $(document).ready(function () {
        $("#led1").click(function () {
            clickLed1 = !clickLed1;
            var light = "false";
            var opacity = "0.1";
            background_color = "gold";
            if (!led1status) {
                opacity = "1";
                light = "true";
            }

            led1status = !led1status;
            $(this).css({'background-color': background_color, 'opacity': opacity});
            var url = publishURL;
            function make_base_auth(user, password) {
                var tok = user + ':' + password;
                var hash = btoa(tok);
                return "Basic " + hash;
            }

            var channelID = "LED1";
            var type = "BOOLEAN";
            makeXML(username, clientID, assetName, type, light, channelID);

            $.ajax({
                type: "POST",
                url: url,
                contentType: 'application/xml',
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', make_base_auth(username, password));
                    xhr.setRequestHeader('Accept', 'application/xml');
                },
                processData: true,
                data: XMLData1,
                crossDomain: true,
                timeout: 15000,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //alert(errorThrown);
                },
                success: function (data, textStatus, XMLHttpRequest) {
                    //alert("Succeeded");
                }
            });

        }); // end of click function
    });

    //LED 2
    $(document).ready(function () {
        $("#led2").click(function () {
            clickLed2 = !clickLed2;
            var light = "false";
            var opacity = "0.1";
            if (!led2status) {
                opacity = "1";
                light = "true";
            }
            led2status = !led2status;
            color = $(this).css("background-color");
            background_color = $(this).css("color");
            $(this).css({'background-color': background_color, 'color': color, 'opacity': opacity});

            var url = publishURL;
            function make_base_auth(user, password) {
                var tok = user + ':' + password;
                var hash = btoa(tok);
                return "Basic " + hash;
            }

            var channelID = "LED2";
            var type = "BOOLEAN";
            makeXML(username, clientID, assetName, type, light, channelID);
            $.ajax({
                type: "POST",
                url: url,
                contentType: 'application/xml',
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', make_base_auth(username, password));
                    xhr.setRequestHeader('Accept', 'application/xml');
                },
                processData: true,
                data: XMLData2,
                timeout: 15000,
                crossDomain: true,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //alert(errorThrown);
                }, success: function (data, textStatus, XMLHttpRequest) {
                    console.log(data)
                }
            });
        }); // end of click function
    });

    //LED 3
    $(document).ready(function () {
        $("#led3").click(function () {
            clickLed3 = !clickLed3;
            var light = "false";
            var opacity = "0.1";

            if (!led3status) {
                opacity = "1";
                light = "true";
            }
            led3status = !led3status;
            color = $(this).css("background-color");
            background_color = $(this).css("color");
            $(this).css({'background-color': background_color, 'color': color, 'opacity': opacity});

            var url = publishURL;
            function make_base_auth(user, password) {
                var tok = user + ':' + password;
                var hash = btoa(tok);
                return "Basic " + hash;
            }

            var channelID = "LED3";
            var type = "BOOLEAN";
            makeXML(username, clientID, assetName, type, light, channelID);
            $.ajax({
                type: "POST",
                url: url,
                contentType: 'application/xml',
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', make_base_auth(username, password));
                    xhr.setRequestHeader('Accept', 'application/xml');
                },
                processData: true,
                data: XMLData3,
                timeout: 15000,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //alert(errorThrown);
                }, success: function (data, textStatus, XMLHttpRequest) {
                    //alert("Succeeded");
                }
            });
        }); // end of click function
    });

    //LED 4 RED
    $(document).ready(function () {
        $("#led4red").click(function () {
            var ledColor = "red"
            clickLed4red = !clickLed4red;
            var light = "false";
            var opacity = "0.4";
            color = $(this).css("background-color");
            background_color = $(this).css("color");

            if (!led4redStatus) {
                opacity = "1";
                light = "true";
            }

            led4redStatus = !led4redStatus;

            var url = publishURL;
            function make_base_auth(user, password) {
                var tok = user + ':' + password;
                var hash = btoa(tok);
                return "Basic " + hash;
            }

            var channelID = "LED4-RED";
            var type = "BOOLEAN";
            makeXML(username, clientID, assetName, type, light, channelID);

            $.ajax({
                type: "POST",
                url: url,
                contentType: 'application/xml',
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', make_base_auth(username, password));
                    xhr.setRequestHeader('Accept', 'application/xml');
                },
                processData: true,
                data: XMLData4,
                timeout: 15000,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //alert(errorThrown);
                }, success: function (data, textStatus, XMLHttpRequest) {
                    //alert("Succeeded");
                }
            });
        }); // end of click function
    });


    //LED 4 GREEN
    $(document).ready(function () {
        $("#led4green").click(function () {
            var ledColor = "green"
            clickLed4green = !clickLed4green;
            var light = "false";
            var opacity = "0.4";

            color = $(this).css("background-color");
            background_color = $(this).css("color");

            if (!led4greenStatus) {
                opacity = "1";
                light = "true";
            }
            led4greenStatus = !led4greenStatus;

            var url = publishURL;
            function make_base_auth(user, password) {
                var tok = user + ':' + password;
                var hash = btoa(tok);
                return "Basic " + hash;
            }

            var channelID = "LED4-GREEN";
            var type = "BOOLEAN";
            makeXML(username, clientID, assetName, type, light, channelID);

            $.ajax({
                type: "POST",
                url: url,
                contentType: 'application/xml',
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', make_base_auth(username, password));
                    xhr.setRequestHeader('Accept', 'application/xml');
                },
                processData: true,
                data: XMLData5,
                timeout: 15000,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //alert(errorThrown);
                },
                success: function (data, textStatus, XMLHttpRequest) {
                    //alert("Succeeded");
                }
            });
        }); // end of click function
    });

    //LED 4 BLUE
    $(document).ready(function () {
        $("#led4blue").click(function () {
            var ledColor = "blue"
            clickLed4blue = !clickLed4blue;
            var light = "false";
            var opacity = "0.4";

            color = $(this).css("background-color");
            background_color = $(this).css("color");

            if (!led4blueStatus) {
                opacity = "1";
                light = "true";
            }

            led4blueStatus = !led4blueStatus;
            var url = publishURL;
            function make_base_auth(user, password) {
                var tok = user + ':' + password;
                var hash = btoa(tok);
                return "Basic " + hash;
            }

            var channelID = "LED4-BLUE";
            var type = "BOOLEAN";
            makeXML(username, clientID, assetName, type, light, channelID);

            $.ajax({
                type: "POST",
                url: url,
                contentType: 'application/xml',
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', make_base_auth(username, password));
                    xhr.setRequestHeader('Accept', 'application/xml');
                },
                processData: true,
                data: XMLData6,
                timeout: 15000,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //alert(errorThrown);
                },
                success: function (data, textStatus, XMLHttpRequest) {
                    //alert("Succeeded");
                }
            });
        }); // end of click function
    });


    //RESET COUNTER C3
    $(document).ready(function () {
        $("#reset_c3").click(function () {
            var url = publishURL;
            function make_base_auth(user, password) {
                var tok = user + ':' + password;
                var hash = btoa(tok);
                return "Basic " + hash;
            }


            var channelID = "Reset-Counter-3";
            var resetMetric = "value";
            var resetValue = "true";
            var type = "BOOLEAN";
            makeResetXML(username, clientID, assetName, type, resetValue, channelID);

            $.ajax({
                type: "POST",
                url: url,
                contentType: 'application/xml',
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', make_base_auth(username, password));
                    xhr.setRequestHeader('Accept', 'application/xml');
                },
                processData: true,
                data: XMLReset,
                timeout: 15000,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //alert(errorThrown);
                },
                success: function (data, textStatus, XMLHttpRequest) {
                    //alert("Succeeded");
                }
            });
        }); // end of click function
    });

    //RESET QUAD COUNTER
    $(document).ready(function () {
        $("#reset_qc").click(function () {
            var url = publishURL;
            function make_base_auth(user, password) {
                var tok = user + ':' + password;
                var hash = btoa(tok);
                return "Basic " + hash;
            }


            var channelID = "Reset-Quad-Counter";
            var resetMetric = "value";
            var resetValue = "true";
            var type = "BOOLEAN";
            makeResetXML(username, clientID, assetName, type, resetValue, channelID);

            $.ajax({
                type: "POST",
                url: url,
                contentType: 'application/xml',
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', make_base_auth(username, password));
                    xhr.setRequestHeader('Accept', 'application/xml');
                },
                processData: true,
                data: XMLReset,
                timeout: 15000,
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //alert(errorThrown);
                },
                success: function (data, textStatus, XMLHttpRequest) {
                    //alert("Succeeded");
                }
            });
        }); // end of click function
    });

    $('#logout').click(function (e) {
        e.preventDefault();

        $('<div id="confirmLogout" title="Logout">Are you sure you want to log out?</div>').dialog({
            modal: true,
            height: 120,
            width: 350,
            show: "blind",
            hide: "blind",
            buttons: {
                "Yes": function () {
                    $.ajax({
                        url: logoutURL,
                        complete: function () {
                            $('#confirmLogout').html("Logged out!");
                            $('.ui-dialog-buttonpane').css('display', 'none');
                            var dlg = $("#confirmLogout").parents(".ui-dialog:first");
                            dlg.animate({width: 250}, 120);
                            setTimeout(function () {
                                $("#confirmLogout").dialog("close")
                            }, 1000);
                            setTimeout(function () {
                                location.reload();
                            }, 1000);
                        }
                    });
                },
                "No": function () {
                    $("#confirmLogout").dialog("close");
                }
            },
            close: function () {
                $("#confirmLogout").remove();
            }
        });
        return false;
    });
}

function processMetrics(metric) {
	var metricName = metric.name;
    if (metricName === 'Counter-3') {
    	typedValue = metric.int_value;
        window.c3String = typedValue;

        $('div.c3-text').text(window.c3String).css({'background-color': 'none', 'font-weight': 'bolder', 'position': 'absolute',
            'left': '205px', 'top': '330px', 'color': 'white', 'font-family': 'tahoma', 'font-size': '11pt', 'padding-top': '19px', 'padding-bottom': '19px',
            'padding-right': '13px', 'padding-left': '13px'});
    }

    if (metricName === 'Quad-Counter') {
    	typedValue = metric.int_value;
        window.qcString = typedValue;
        $('div.qc-text').text(window.qcString).css({'background-color': 'none', 'font-weight': 'bolder', 'position': 'absolute',
            'left': '555px', 'top': '331px', 'color': 'white', 'font-family': 'tahoma', 'font-size': '11pt', 'padding-top': '19px', 'padding-bottom': '19px',
            'padding-right': '20px', 'padding-left': '20px'});
    }

    if (metricName === 'LED1') {
    	typedValue = metric.bool_value;
        window.led1String = typedValue.toString();
        var ledID = "1";
        var led1color = "gold";
        var gotLed1Value = "";
        var ledstatus = led1status;

        if (typedValue.toString() === 'true') {
            gotLed1Value = !gotLed1Value;
        }
        if (!clickLed1) {
            displayLedStatus(ledID, gotLed1Value, led1color);
        }
        clickLed1 = "";
    }

    if (metricName === 'LED2') {
    	typedValue = metric.bool_value;
        window.led2String = typedValue.toString();
        var ledID = "2";
        var led2color = "gold";
        var gotLed2Value = "";
        var ledstatus = led2status;

        if (typedValue.toString() === 'true') {
            gotLed2Value = !gotLed2Value;
        }
        if (!clickLed2) {
            displayLedStatus(ledID, gotLed2Value, led2color);
        }
        clickLed2 = "";
    }

    if (metricName === 'LED3') {
    	typedValue = metric.bool_value;
        window.led3String = typedValue.toString();
        var ledID = "3";
        var led3color = "gold";
        var gotLed3Value = "";
        var ledstatus = led3status;

        if (typedValue.toString() === 'true') {
            gotLed3Value = !gotLed3Value;
        }
        if (!clickLed3) {
            displayLedStatus(ledID, gotLed3Value, led3color);
        }
        clickLed3 = "";
    }

    if (metricName === 'LED4-RED' || metricName === 'LED4-GREEN' || metricName === 'LED4-BLUE') {

        if (metricName === 'LED4-RED') {
        	typedValue = metric.bool_value;
            readRed = !readRed;
            window.led4rString = typedValue.toString();
            redIsOn = "";
            var ledID = "4";
            var gotLed4Value = "";
            var led4color = "red";
            if (typedValue.toString() === 'true') {
                gotLed4Value = !gotLed4Value;
                redIsOn = !redIsOn;
            }
        }

        if (metricName === 'LED4-GREEN') {
        	typedValue = metric.bool_value;
            readGreen = !readGreen;
            window.led4gString = typedValue.toString();
            greenIsOn = "";
            var ledID = "4";
            var gotLed4Value = "";
            var led4color = "green";
            if (typedValue.toString() === 'true') {
                gotLed4Value = !gotLed4Value;
                greenIsOn = !greenIsOn;
            }
        }

        if (metricName === 'LED4-BLUE') {
        	typedValue = metric.bool_value;
            readBlue = !readBlue;
            window.led4gString = typedValue.toString();
            blueIsOn = "";
            var ledID = "4";
            var gotLed4Value = "";
            var led4color = "blue";
            if (typedValue.toString() === 'true') {
                gotLed4Value = !gotLed4Value;
                blueIsOn = !blueIsOn;
            }
        }
        if (readRed && readGreen && readBlue) {
            if (!clickLed4) {
                displayLed4();
            }
            clickLed4 = "";
        }
    }

    if (metricName === 'Toggle-4') {
    	typedValue = metric.bool_value;
        window.t4String = typedValue.toString();
        var toggleID = "4";
        var gotToggle4Value = "";

        if (typedValue.toString() === 'true') {
            gotToggle4Value = !gotToggle4Value;
        }
        displayToggleStatus(toggleID, gotToggle4Value);
    }

    if (metricName === 'Toggle-5') {
    	typedValue = metric.bool_value;
        window.t5String = typedValue.toString();
        var toggleID = "5";
        var gotToggle5Value = "";


        if (typedValue.toString() === 'true') {
            gotToggle5Value = !gotToggle5Value;
        }
        displayToggleStatus(toggleID, gotToggle5Value);
    }

    if (metricName === 'Toggle-6') {
    	typedValue = metric.bool_value;
        window.t6String = typedValue.toString();
        var toggleID = "6";
        var gotToggle6Value = "";

        if (typedValue.toString() === 'true') {
            gotToggle6Value = !gotToggle6Value;
        }
        displayToggleStatus(toggleID, gotToggle6Value);
    }
}
