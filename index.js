import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://realtime-database-bc273-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "publicShoppingList")

const addButtonEl = document.getElementById("add-button")
const inputFieldEl = document.getElementById("input-field")
const shoppingListEl = document.getElementById("shopping-list")


addButtonEl.addEventListener("click", function() {
    let inputValue = inputFieldEl.value

    push(shoppingListInDB, inputValue)

    clearInputFieldEl()

    inputFieldEl.focus()
})

inputFieldEl.addEventListener("keydown", function(e) {
    if (e.key === 'Enter') {
        addButtonEl.click()
    }
})

onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
        
        clearShoppingListEl()
        
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            let currentItemId = currentItem[0]
            let currentItemValue = currentItem[1]

            appendItemToShoppingListEl(currentItem)
        }
    } else {
        shoppingListEl.innerHTML = "No items here... yet"
    }
})

function clearShoppingListEl() {
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl() {
    inputFieldEl.value = ""
}

function appendItemToShoppingListEl(input) {
    let itemID = input[0]
    let itemValue = input[1]

    let newEl = document.createElement("li")
    newEl.textContent = itemValue
    shoppingListEl.append(newEl)

    newEl.addEventListener("dblclick", function() {
        navigator.clipboard.writeText(itemValue)

        let exactLocationOfItemInDB = ref(database, `publicShoppingList/${itemID}`)

        remove(exactLocationOfItemInDB)
    })
}



let infoImg = document.querySelector("#info-img")
let subMainSection = document.querySelector("#main-section")
let infoSection = document.querySelector("#info-section")
let infoSectionToggle = 0 

let catImg = document.querySelector("#cat-img")
let inputField = document.querySelector("#input-field")
let addBtn = document.querySelector("#add-button")
let shopList = document.querySelector("#shopping-list")

infoImg.addEventListener("click", function() {
    if (infoSectionToggle % 2 === 0) {
        subMainSection.className = "disappear"

        catImg.className = "disappear"
        inputField.className = "disappear"
        addBtn.className = "disappear"
        shopList.className = "disappear"

        infoSection.className = ""
        infoSectionToggle += 1
    } else {
        subMainSection.className = ""

        catImg.className = ""
        inputField.className = ""
        addBtn.className = ""
        shopList.className = ""

        infoSection.className = "disappear"
        infoSectionToggle += 1
    }
})










let toggleDBName = "publicShoppingListImageToggle"
const imageToggleInDB = ref(database, toggleDBName)

let toggleValue = ""
let imageList = []
let timeValue = -1
let currentDate = ""
let functionToggle = 1

let imageToggle = document.getElementById("seasonalImagesToggle")
imageToggle.innerHTML = "Seasonal Images: Off"

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
let date = new Date().getDate()
let month = new Date().getMonth()
let theDate = date + " " + months[month]


onValue(imageToggleInDB, function(snapshot) {
    if (snapshot.exists()) {

        let itemsArray = Object.entries(snapshot.val())
        let item = itemsArray[0][1]

        toggleValue = item.imageToggle
        timeValue = item.time
        currentDate = item.currentDate
        imageList = item.todaysImages

        if (theDate != currentDate) {
            imageList = []
        }

        render()

    } 
})



function render() {
    if (functionToggle === 1) {
        functionToggle = 0 

        if (toggleValue == 1) {

            imageToggle.innerHTML = "Seasonal Images: On"
            let hour = new Date().getHours()
            renderNewImg(hour)

        } else {

            imageToggle.innerHTML = "Seasonal Images: Off"

            if (imageList.length > 0) {
                if (imageList[imageList.length - 1] != "cat.png") {
                    imageList.push("cat.png")
                }

                for (let i = 0; i < imageList.length; i++) {
                    if (imageList[i] != "cat.png") {
                        document.getElementById(imageList[i]).className = "disappear"
                    } 
                }
            }

            document.getElementById("cat.png").className = "catImg" 

            addInfo("0", imageList, halfHour(), theDate)

        }
    }
}












// seasonal image button toggle

imageToggle.addEventListener("click", function() {
    if (toggleValue == 0) {

        functionToggle = 1

        toggleValue = 1

        render() 

    } else if (toggleValue == 1) {

        functionToggle = 1

        toggleValue = 0 
        
        render()

    } 
})











// organising images

const images = [
    ["breakfast", ["57.gif", "13.png", "49.png", "51.png", "83.gif"]],
    ["sleeping", ["1.gif", "29.png", "54.gif", "59.gif", "67.gif", "68.gif", "88.gif"]],
    ["eating", ["8.gif", "9.gif", "11.gif", "19.png", "20.png", "34.png", "42.png", "49.png", "51.png", "61.gif", "63.gif", "96.gif"]],
    ["cooking", ["5.gif", "13.png", "21.png", "33.png", "73.gif"]],
    ["misc", ["2.gif", "9.gif", "14.png", "15.png", "17.png", "18.png", "22.png", "29.png", "56.gif", "58.gif", "62.gif", "70.gif", "71.gif", "72.gif", "74.gif", "75.gif", "76.gif", "78.gif", "82.gif", "83.gif", "89.gif", "91.gif", "92.gif", "93.gif", "94.gif", "97.gif", "98.gif", "100.gif"]],

    ["celebration", ["12.gif", "30.png", "58.gif", "60.gif", "77.gif", "79.gif", "94.gif", "101.gif"]],
    ["birthday", ["12.gif", "30.png", "36.png", "58.gif", "60.gif", "65.gif", "74.gif", "77.gif", "79.gif", "94.gif", "101.gif"]],
    ["valentines", ["23.png", "52.png", "54.gif", "65.gif", "78.gif", "87.gif"]],
    ["easter", ["27.png", "28.png", "66.gif"]],
    ["halloween", ["48.png", "64.gif", "74.gif"]],
    ["christmas", ["7.gif", "16.png", "24.png", "25.png", "26.png", "31.png", "37.png", "39.png", "46.png", "50.png", "53.png", "60.gif"]],
    ["newYears", ["12.gif", "30.png", "57.gif", "77.gif", "79.gif", "94.gif", "101.gif"]],

    ["aprilFools", ["71.gif", "98.gif"]],
    ["guyFawkes", ["77.gif"]],
    ["remembranceDay", ["65.gif"]],

    ["spring", ["32.png", "55.gif", "69.gif", "72.gif", "90.gif", "91.gif", "100.gif"]],
    ["summer", ["41.png", "47.png", "69.gif", "80.gif", "90.gif", "93.gif", "100.gif"]],
    ["autumn", ["38.png", "55.gif", "69.gif", "72.gif", "95.gif", "100.gif"]],
    ["winter", ["24.png", "25.png", "39.png", "50.png", "69.gif", "95.gif"]],

    ["evening", ["2.gif", "6.gif", "14.png", "15.png", "17.png", "22.png", "43.png", "56.gif", "62.gif", "69.gif", "70.gif", "71.gif", "76.gif", "78.gif", "82.gif", "83.gif", "89.gif"]]
]









// important dates

let year = new Date().getFullYear()
function getEaster(year) {
	var f = Math.floor,
		// Golden Number - 1
		G = year % 19,
		C = f(year / 100),
		// related to Epact
		H = (C - f(C / 4) - f((8 * C + 13)/25) + 19 * G + 15) % 30,
		// number of days from 21 March to the Paschal full moon
		I = H - f(H/28) * (1 - f(29/(H + 1)) * f((21-G)/11)),
		// weekday for the Paschal full moon
		J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
		// number of days from 21 March to the Sunday on or before the Paschal full moon
		L = I - J,
		month = 3 + f((L + 40)/44),
		day = L + 28 - 31 * f(month / 4);

	return [month,day];
}
let easterMonth = getEaster(year)[0] - 1
let easterDate = getEaster(year)[1]
let fullEasterDate = easterDate + " " + months[easterMonth]


const importantDates = [
    ["birthday", "10 November"],
    ["celebration", "10 November"],
    ["christmas", "14 December", "15 December", "16 December", "17 December", "18 December", "19 December", "20 December", "21 December", "22 December", "23 December", "24 December", "25 December", "26 December", "27 December"], 
    ["halloween", "24 October", "25 October", "26 October", "27 October", "28 October", "29 October", "30 October", "31 October"],
    ["valentines", "10 February", "11 February", "12 February", "13 February", "14 February"],
    ["newYears", "31 December", "1 January"],
    ["easter", fullEasterDate],
    ["aprilFools", "1 April"],
    ["guyFawkes", "5 November"],
    ["remembranceDay", "11 November"]
]











// rendering out new image

function renderNewImg(hours) {

    let imageListLength = imageList.length
    let lastImage = imageList[imageListLength - 1]

    if (lastImage != "cat.png" && halfHour() == timeValue) {

        document.getElementById("cat.png").className = "disappear"    
        document.getElementById(lastImage).className = "catImg"

        addInfo("1", imageList, timeValue, theDate)

    } else {

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

        let useableImages = []
        let event = ""
        let eventIndex = 0 

        for (let i = 0; i < importantDates.length; i++) {
            for (let j = 0; j < importantDates[i].length; j++) {
                if (theDate == importantDates[i][j]) {
                    for (let k = 0; k < images.length; k++) {
                        if (images[k][0] === importantDates[i][0]) {
                            event = images[k][0]
                            eventIndex = k 
                            useableImages = useableImages.concat(images[k][1].filter((item) => useableImages.indexOf(item) < 0))
                        }
                    }
                }
            }
        }

        if (event == "birthday" || event == "newYears" || event == "christmas" || event == "halloween" || event == "easter" || event == "valentines") {
            useableImages = useableImages.concat(images[eventIndex][1].filter((item) => useableImages.indexOf(item) < 0))
        } else if (hours < 7 || hours > 21) {
            useableImages = useableImages.concat(images[1][1].filter((item) => useableImages.indexOf(item) < 0))
        } else if (hours == 7 || hours == 8) {
            useableImages = useableImages.concat(images[0][1].filter((item) => useableImages.indexOf(item) < 0))
        } else if (hours == 18) {
            useableImages = useableImages.concat(images[3][1].filter((item) => useableImages.indexOf(item) < 0))
        } else if (hours == 19) {
            useableImages = useableImages.concat(images[2][1].filter((item) => useableImages.indexOf(item) < 0))
        } else if (hours == 20 || hours == 21) {
            useableImages = useableImages.concat(images[19][1].filter((item) => useableImages.indexOf(item) < 0))
        } else if (hours == 13) {
            useableImages = useableImages.concat(images[2][1].filter((item) => useableImages.indexOf(item) < 0))
        } else if (hours == 16) {
            useableImages = images[2][1][2]
        } else {
            
            if (months[month] == "November" || months[month] == "December" || months[month] == "January") {
                useableImages = useableImages.concat(images[18][1].filter((item) => useableImages.indexOf(item) < 0))
            } else if (months[month] == "February" || months[month] == "March" || months[month] == "April") {
                useableImages = useableImages.concat(images[15][1].filter((item) => useableImages.indexOf(item) < 0))
            } else if (months[month] == "May" || months[month] == "June" || months[month] == "July" || months[month] == "August") {
                useableImages = useableImages.concat(images[16][1].filter((item) => useableImages.indexOf(item) < 0))
            } else if (months[month] == "September" || months[month] == "October") {
                useableImages = useableImages.concat(images[17][1].filter((item) => useableImages.indexOf(item) < 0))
            }

            useableImages = useableImages.concat(images[4][1].filter((item) => useableImages.indexOf(item) < 0))

        }


        let index = Math.floor(Math.random() * useableImages.length)
        let counter = 0
        while (imageList.includes(useableImages[index])) {
            counter += 1
            index = Math.floor(Math.random() * useableImages.length)
            if (counter > 80) {
                imageList = []
                imageList.push(useableImages[index])
            }
        }

        document.getElementById("cat.png").className = "disappear"    
        document.getElementById(useableImages[index]).className = "catImg"

        imageList.push(useableImages[index])

        addInfo("1", imageList, halfHour(), theDate)

    } 
}





function addInfo(imageToggle, todaysImages, time, currentDate) {
    
    let arr = []
    for (let i = 0; i < todaysImages.length; i++) {
        arr.push([i, todaysImages[i]])
    }
    
    const obj = Object.fromEntries(arr)
    
    remove(imageToggleInDB)
    push(imageToggleInDB, {
        "imageToggle": imageToggle, 
        "time": time,
        "currentDate": currentDate,
        "todaysImages": obj,
    })

}


function halfHour() {

    let minutes = new Date().getMinutes()
    let hour = new Date().getHours()

    if (minutes >= 30) {
        return (hour + ":30")
    } else {
        return (hour + ":00")
    }

}
