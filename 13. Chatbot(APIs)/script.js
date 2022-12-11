onload = function(){
    // outputs a javascript object from the parsed json

        var chat = {
            messageToSend: '',
            messageResponses: [
                'Why did the web developer leave the restaurant? Because of the table layout.',
                'How do you comfort a JavaScript bug? You console it.',
                'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',
                'What is the most used language in programming? Profanity.',
                'What is the object-oriented way to become wealthy? Inheritance.',
                'An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol'
            ],
            init: async function() {
                this.chatTree = new ChatTree();
                await this.chatTree.init();
                this.cacheDOM();
                this.bindEvents();
                await this.render();
            },
            cacheDOM: function() {
                this.$chatHistory = $('.chat-history');
                this.$button = $('button');
                this.$textarea = $('#message-to-send');
                this.$chatHistoryList =  this.$chatHistory.find('ul');
            },
            bindEvents: function() {
                this.$button.on('click', this.addMessage.bind(this));
                this.$textarea.on('keyup', this.addMessageEnter.bind(this));
            },
            render: async function() {
                this.scrollToBottom();
                if (this.messageToSend.trim() !== '') {
                    var template = Handlebars.compile( $("#message-template").html());
                    var context = {
                        messageOutput: this.messageToSend,
                        time: this.getCurrentTime()
                    };

                    this.input = this.messageToSend;
                    this.$chatHistoryList.append(template(context));
                    this.scrollToBottom();
                    this.$textarea.val('');

                    // responses
                    var templateResponse = Handlebars.compile( $("#message-response-template").html());
                    var contextResponse = {
                        response: await this.chatTree.getMessage(this.input),
                        time: this.getCurrentTime()
                    };

                    setTimeout(function() {
                        this.$chatHistoryList.append(templateResponse(contextResponse));
                        this.scrollToBottom();
                    }.bind(this), 1000);

                }

            },

            addMessage: function() {
                this.messageToSend = this.$textarea.val();
                this.render();
            },
            addMessageEnter: function(event) {
                // enter was pressed
                if (event.keyCode === 13) {
                    this.addMessage();
                }
            },
            scrollToBottom: function() {
                this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
            },
            getCurrentTime: function() {
                return new Date().toLocaleTimeString().
                replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
            }
        };

        chat.init();
};

class ChatTree {

    constructor() {
    }

    async init(){
        const data = await this.reset();
        this.chat_tree = data;
        this.firstMsg = true;
        console.log("inside done");
        return "Chat has now been terminated. Send hi to begin chat again !";
    }

    async reset(){
        const response = await fetch('chat_tree.json');
        const jsonResponse = await response.json();
        return jsonResponse;
    }

    async getMessage(input){
        let resp = '';
        //input = new String(input.trim());
        //console.log(input);
        if(this.firstMsg===true) {
            this.firstMsg = false;
            resp += "Hey there buddy<br>";
        } else {

            if(("message" in this.chat_tree) && (input.trim()==="Reset")) {
                return this.init();
            }

            if(isNaN(parseInt(input)) || parseInt(input)<=0 || parseInt(input) > this.chat_tree['children'].length+1)
                return 'It seems like you gave a wrong input ! Go ahead try again !';

            if(parseInt(input)-1===this.chat_tree['children'].length){
                this.init();
            }

            this.chat_tree = this.chat_tree['children'][parseInt(input)-1];
        }

        if("message" in this.chat_tree){
            let data;
            if(this.chat_tree['type']==="function"){
                // console.log(String(this.chat_tree['message']),String("getJoke()"));
                if(this.chat_tree['message']==="getJokeSP()" || this.chat_tree['message']==="getJokeEN()"){
                    data = await eval(this.chat_tree['message']);
                    data = data.joke;
                } else if(this.chat_tree['message']==="getNewsBC()"||this.chat_tree['message']==="getNewsSC()" || this.chat_tree['message']==="getNewsQatar()"){
                    data = await eval(this.chat_tree['message']);
                    var tam=data.articles.length-1;
                    var rand = Math.floor(Math.random() * tam);
                    try{data = "<img src='"+data.articles[rand].urlToImage+"' width='85%'></img><br>"+data.articles[rand].title+"<br>"+data.articles[rand].description+"<br><br>"+"<a href='"+data.articles[rand].url+"'>"+data.articles[rand].url+"</a>";
                    }
                    catch (e) {
                        data=data.articles[rand].title+"<br>"+data.articles[rand].description+"<br><br>"+data.articles[rand].url;
                    }
                }
            } else{
                data = await this.chat_tree['message'];
                if(data==="getWeatherTd()"){
                    try{
                        data=await eval(this.chat_tree['message']);
                        let condi=data.current.condition.text;
                        let condi_img=data.current.condition.icon;
                        let temp=data.current.temp_c;
                        data = condi_img+"Condition: "+condi+"<br>"+"Temperature: "+temp+"°C<br>";
                    } catch (e) {
                        data = "Información del clima fuera de servicio	 ";
                    }
                }
                if(data==="getWeatherTm()")
                    try{
                        data=await eval(this.chat_tree['message']);
                        let condi=data.forecast.forecastday.condition.text;
                        let condi_img=data.forecast.forecastday.condition.icon;
                        let temp=data.forecast.forecastday.avgtemp_c;
                        data = condi_img+"Condicion: "+condi+"<br>"+"Temperatura promedio: "+temp+"°C<br>";
                    } catch (e) {
                        data = "Información del clima fuera de servicio";
                    }
            }
            resp += data;
            resp += "<br><br>Please input <b>Reset</b> to reset chat now";
        } else {
            for (let i in this.chat_tree['child_msg']) {
                resp += String(parseInt(i) + 1) + ". " + this.chat_tree['child_msg'][parseInt(i)] + "<br>";
            }
        }
        return resp;
    }
}

//e9712a2f5c974cd49876955e6d391db4 api Key
async function getJokeSP() {
    const response = await fetch('https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Dark,Pun,Spooky,Christmas?blacklistFlags=nsfw,political,racist,sexist,explicit&type=single&lang=es');
    const jsonResp = await response.json();
    return jsonResp;
}

async function getJokeEN() {
    const response = await fetch('https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Dark,Pun,Spooky,Christmas?blacklistFlags=nsfw,political,racist,sexist,explicit&type=single');
    const jsonResp = await response.json();
    return jsonResp;
}

async function getNewsSC() {
    const response = await fetch('https://newsapi.org/v2/top-headlines?category=science&apiKey=e9712a2f5c974cd49876955e6d391db4&language=es');
    const jsonResp = await response.json();
    return jsonResp;
}

async function getNewsBC() {
    const response = await fetch('https://newsapi.org/v2/top-headlines?q=bitcoin&apiKey=e9712a2f5c974cd49876955e6d391db4&language=es');
    const jsonResp = await response.json();
    return jsonResp;
}

async function getNewsQatar() {
    const response = await fetch('https://newsapi.org/v2/top-headlines?q=Qatar&apiKey=e9712a2f5c974cd49876955e6d391db4&language=es');
    const jsonResp = await response.json();
    return jsonResp;
}

async function getWeatherTd()
{
    const response = await fetch('http://api.weatherapi.com/v1/current.json?key=5d108666afc144dba4b33110221112&q=Comayagua&aqi=yes');
    const jsonResp = await response.json();
    return jsonResp;
}

async function getWeatherNw()
{
    const response = await fetch('http://api.weatherapi.com/v1/forecast.json?key=5d108666afc144dba4b33110221112&q=Comayagua&days=7&aqi=no&alerts=no');
    const jsonResp = await response.json();
    return jsonResp;
}

async function getWeatherTm()
{
    const response = await fetch('http://api.weatherapi.com/v1/forecast.json?key=5d108666afc144dba4b33110221112&q=Comayagua&days=1&aqi=no&alerts=no');
    const jsonResp = await response.json();
    return jsonResp;
}