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

