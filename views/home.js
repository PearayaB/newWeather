const appKey ="8d57fe1e61dec450763ffad87e49b3f7"

const searchButton = document.querySelector("#search-btn");
const searchInput = document.querySelector("#search-txt");
const cityName = document.querySelector("#city-name");
const icon = document.querySelector("#icon");
const temperature = document.querySelector("#temp");
const humidity = document.querySelector("#humidity-div");
const PM = document.querySelector("#PM");
const main = document.querySelector("#main");
const description = document.querySelector("#description");
const fahrenheit = document.querySelector("#fahrenheit");

searchButton.addEventListener("click",findWeatherDetails);
searchInput.addEventListener("keyup",enterPressed);

function enterPressed(event){
    if(event.key == "Enter"){
        findWeatherDetails();
    }
}

function findWeatherDetails(){
    if(searchInput.value == ""){

    } else{
        const searchLink = "http://api.openweathermap.org/data/2.5/weather?q=" + searchInput.value + "&appid=" + appKey;
        httpRequestAsync(searchLink,theResponse);
    }

}


function theResponse(response){
    const jsonObject = JSON.parse(response); // json => js object//
    cityName.innerHTML = jsonObject.name;
    icon.src = "https://openweathermap.org/img/w/"+jsonObject.weather[0].icon + ".png";
    temperature.innerHTML = parseInt(jsonObject.main.temp -273) + "°";
    humidity.innerHTML = jsonObject.main.humidity + "%";
    main.innerHTML = jsonObject.weather[0].main;
    description.innerHTML = jsonObject.weather[0].description;
    fahrenheit.innerHTML = parseInt(jsonObject.main.temp -273)*9/5 +32 +"°F";
    
    console.log(main);
}

function httpRequestAsync(url,callback){
    const httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () =>{
        if (httpRequest.readyState == 4 && httpRequest.status ==200){
        callback(httpRequest.responseText); //return text//
    }
}

httpRequest.open("GET",url,true); // true foe async //
httpRequest.send();
}
