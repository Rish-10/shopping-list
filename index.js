import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, onValue, push, ref, remove, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://realtime-database-bc273-default-rtdb.europe-west1.firebasedatabase.app/"
}

const name = "Someone"
const shoppingListName = name + "shoppingList"

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, shoppingListName)

const mainSection = document.getElementById("main-section")
const sectionListSection = document.getElementById("section-list")
const infoSection = document.getElementById("info-section")

const infoImg = document.getElementById("info-img")
const regularListImg = document.getElementById("regular-list-img")
const shoppingListImg = document.getElementById("shopping-list-img")
const regularAccListImg = document.getElementById("regular-actual-list-img")
const shoppingAccListImg = document.getElementById("shopping-actual-list-img")
const shoppingImg = document.getElementById("shopping-img")
const regularImg = document.getElementById("regular-img")

const shoppingListTitle = document.getElementById("shopping-title")
const addButtonEl = document.getElementById("add-button")
const clearButtonEl = document.getElementById("clear-button")
const inputFieldEl = document.getElementById("input-field")
const quantityFieldEl = document.getElementById("input-quantity-field")

const shoppingListEl = document.getElementById("shopping-list")
const sectionListEl = document.getElementById("section-list")
const innerContainerEl = document.getElementById("inner-container-el")

const notesToggleEl = document.getElementById("notes-toggle")
const notesAreaEl = document.getElementById("notes-area")
const spaceBelowShoppingListsEl = document.getElementById("space-bottom-el")

const selectWrapperEl = document.getElementById("select-wrapper")
const sectionSelectorEl = document.getElementById("sectionSelector")
const sectionAdderEl = document.getElementById("sectionAdder")
const sectionAddBtnEl = document.getElementById("add-section-button")
const customDropdownWrapperEl = document.getElementById("custom-dropdown-wrapper")
const currentlySelectedEl = document.getElementById("currently-selected")
const customSelectOptionsEl = document.getElementById("custom-select-options")

let currentList = "shoppingList"
let shoppingListInfo = []
let renderedSections = []
let openedSections = []


notesToggleEl.addEventListener("click", function() {
    closeBottomBars()
    customSelectOptionsEl.className = "disappear"
    if (notesAreaEl.hidden) {
        notesAreaEl.hidden = false 
        notesAreaEl.focus()
    } else {
        notesAreaEl.hidden = true 
    }
})

sectionAddBtnEl.addEventListener("click", function() {
    customSelectOptionsEl.className = "disappear"
    if (sectionAdderEl.hidden) {
        sectionAdderEl.hidden = false 
        sectionAdderEl.focus()
    } else {
        sectionAdderEl.hidden = true
        sectionAdderEl.value = "" 
    }
})

const fields = [inputFieldEl, quantityFieldEl, sectionSelectorEl, sectionAdderEl]
fields.forEach(field => {
    field.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            addButtonEl.click()
        }
    })
})

const fields2 = [inputFieldEl, quantityFieldEl, notesAreaEl, sectionAddBtnEl, customSelectOptionsEl]
fields2.forEach(field => {
    field.addEventListener("click", (e) => {
        closeBottomBars()
    })
})

addButtonEl.addEventListener("click", function() {
    closeBottomBars()
    customSelectOptionsEl.className = "disappear"

    let inputValue = inputFieldEl.value
    let quantityValue = quantityFieldEl.value 
    let notesValue = notesAreaEl.value
    let sectionValue = ""
    if (sectionAdderEl.value != "") {
        sectionValue = sectionSelectorEl.value + "/" + sectionAdderEl.value
    } else {
        sectionValue = sectionSelectorEl.value
    }

    if (quantityValue > 99) {
        quantityValue = 99
    } else if (quantityValue < 0) {
        quantityValue = 0 
    } else if (quantityValue == "") {
        quantityValue = 0 
    }


    let info = {
        "item": inputValue, 
        "quantity": quantityValue, 
        "notes": notesValue,
        "list": currentList,
        "section": sectionValue
    }

    if (inputValue != "") {
        push(shoppingListInDB, info)
        clearInputFields()
        sectionSelectorEl.value = sectionValue

        let options = Array.from(sectionSelectorEl.options)
        options.forEach((option) => {
            if (option.value == sectionValue) {
                currentlySelectedEl.textContent = option.textContent
            }
        })
    } else {
        inputFieldEl.focus()
    }
})


clearButtonEl.addEventListener("click", function() {
    clearInputFields()
    closeBottomBars()
    customSelectOptionsEl.className = "disappear"
    renderShoppingList()
})

onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        shoppingListInfo = Object.entries(snapshot.val())
        renderShoppingList()
    } else {
        shoppingListInfo = []
        shoppingListEl.className = "" 
        shoppingListEl.innerHTML = "No items here... yet"
        sectionListEl.innerHTML = "" 
    }
})


function renderShoppingList() {
    clearShoppingListEl()
    renderedSections = []
    let noItems = true
    let noItemsInShoppingList = true
    shoppingListInfo = sortShoppingList(shoppingListInfo)
    for (let i = 0; i < shoppingListInfo.length; i++) {
        if (shoppingListInfo[i][1].list == currentList) {
            appendItemToShoppingListEl(shoppingListInfo[i])
            noItems = false 
            if (getSectionValues(shoppingListInfo[i][1].section)[0] === "noSection") {
                noItemsInShoppingList = false; 
            }
        }
    }
    if (noItems) {
        shoppingListEl.innerHTML = "No items here... yet"
    } else if (noItemsInShoppingList) {
        shoppingListEl.className = "disappear"
    } else {
        shoppingListEl.className = ""
    }

    for (let i = 0; i < openedSections.length; i++) {
        if (openedSections[i][1] == true && openedSections[i][2] == currentList) {
            document.getElementById(`${openedSections[i][0]}`).click()
        }
    }

    renderSectionsDropdown()
}



function sortShoppingList(database) {
    // Build a hierarchical structure from the database
    function buildHierarchy(items) {
        const hierarchy = {};

        items.forEach(([id, data]) => {
            const sections = data.section.split('/').map(s => s.trim());
            let current = hierarchy;

            sections.forEach((section, index) => {
                if (!current[section]) {
                    current[section] = { subsections: {}, items: [] };
                }

                if (index === sections.length - 1) {
                    current[section].items.push([id, data]);
                } else {
                    current = current[section].subsections;
                }
            });
        });

        return hierarchy;
    }

    // Recursively sort the hierarchy
    function sortHierarchy(hierarchy) {
        const sortedSections = Object.keys(hierarchy).sort((a, b) => a.localeCompare(b));

        let sortedItems = [];

        sortedSections.forEach(section => {
            const { subsections, items } = hierarchy[section];

            items.sort(([, aData], [, bData]) => aData.item.localeCompare(bData.item));

            sortedItems.push(...items);

            const sortedSubsectionItems = sortHierarchy(subsections);
            sortedItems.push(...sortedSubsectionItems);
        });

        return sortedItems;
    }

    try {
        const hierarchy = buildHierarchy(database);
        return sortHierarchy(hierarchy);
    } catch (error) {
        console.error("Error during processing:", error.message);
        return [];
    }
}

function renderSectionsDropdown() {
    customSelectOptionsEl.innerHTML = ""; // Clear the dropdown

    // Add "No Section ▽" as the first option
    const noSectionLi = document.createElement("li");
    noSectionLi.textContent = "No Section ▽";
    noSectionLi.dataset.value = "noSection"; // Set value for "No Section"
    customSelectOptionsEl.appendChild(noSectionLi);

    // Step 1: Build hierarchy from sectionSelectorEl options
    const hierarchy = {};
    const options = Array.from(sectionSelectorEl.options);

    options.forEach(option => {
        const sectionPath = option.value.split('/').map(s => s.trim()); // Split the section by '/'
        let current = hierarchy;

        sectionPath.forEach((section, index) => {
            if (section === "noSection") return; // Skip "noSection" in hierarchy

            if (!current[section]) {
                current[section] = { subsections: {} };
            }

            // Traverse to the next level
            current = current[section].subsections;
        });
    });

    // Step 2: Render dropdown based on the hierarchy
    function renderHierarchy(hierarchy, parentPath = [], indentLevel = 0) {
        const indent = "&nbsp;".repeat(indentLevel * 4); // Indentation using non-breaking spaces

        Object.keys(hierarchy).sort((a, b) => a.localeCompare(b)).forEach(section => {
            // Generate the full path by combining parentPath and current section
            const fullPath = [...parentPath, section].join('/');

            // Create the list item
            const li = document.createElement("li");

            // Set the list item text with indentation and section name
            li.innerHTML = `${indent}${section}`;
            li.dataset.value = fullPath; // Assign the full section path to data-value

            // Append the list item to the dropdown
            customSelectOptionsEl.appendChild(li);

            // Recursively render subsections, passing the updated path
            renderHierarchy(hierarchy[section].subsections, [...parentPath, section], indentLevel + 1);
        });
    }

    renderHierarchy(hierarchy); // Start rendering the hierarchy
}

currentlySelectedEl.addEventListener("click", () => {
    if (customSelectOptionsEl.className == "disappear") {
        customSelectOptionsEl.className = "custom-options" 
    } else {
        customSelectOptionsEl.className = "disappear"
    }
})

document.addEventListener("click", (event) => {
    if (!customSelectOptionsEl.contains(event.target) && !currentlySelectedEl.contains(event.target)) {
        customSelectOptionsEl.className = "disappear"
    } 
});

customSelectOptionsEl.addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
        // let value = event.target.dataset.value
        let value = "noSection"
        let text = event.target.textContent.trim()

        let options = Array.from(sectionSelectorEl.options)
        options.forEach((option) => {
            if (option.textContent == text) {
                value = option.value
            }
        })

        currentlySelectedEl.textContent = text
        sectionSelectorEl.value = value 
        customSelectOptionsEl.className = "disappear"
    }
})

function clearShoppingListEl() {
    shoppingListEl.innerHTML = ""
    innerContainerEl.innerHTML = "" 
    sectionSelectorEl.innerHTML = `<option class='select-items' value='noSection' selected='selected'>No Section ▽</option>`
    currentlySelectedEl.textContent = "No Section ▽"
    sectionAdderEl.innerHTML = "" 
    sectionListEl.innerHTML = "" 
}

function clearInputFields() {
    inputFieldEl.value = ""
    quantityFieldEl.value = ""
    notesAreaEl.value = ""
    // sectionAdderEl.hidden = true
    sectionAdderEl.value = "" 
}

function renderSection(sectionName, theDisplaySectionValues, decidedList, shoppingList, ogSectionValue) {
    addSectionToSelector(sectionName, ogSectionValue)

    let sectionDiv = document.createElement("div")
    let sectionHeader = document.createElement("h3")
    // sectionHeader.innerHTML = `<h3 id='${sectionName-title}' class="heading">▷ ${sectionName}</h3>`
    sectionHeader.id = `${sectionName}-${shoppingList}-title`
    sectionHeader.className = "heading"
    sectionHeader.textContent = `▷ ${sectionName}`
    sectionDiv.append(sectionHeader)

    let theSectionList = document.createElement("ul")
    theSectionList.id = `${sectionName}-${shoppingList}-items-list`
    theSectionList.className = "disappear"      
    // class changes to 'a-shopping-list'
    sectionDiv.append(theSectionList)

    let subSections = document.createElement("div")
    subSections.id = `${sectionName}-${shoppingList}-subsections`
    subSections.className = "disappear"         
    // class changes to 'indent-left'
    sectionDiv.append(subSections)

    if (decidedList == null) {
        if (theDisplaySectionValues[1] != "noSection" && theDisplaySectionValues[1] != '') {
            let found = false 
            for (let i = 0; i < renderedSections.length; i++) {
                if (renderedSections[i][0] == theDisplaySectionValues[1] && found == false) {
                    found = true 
                    document.getElementById(`${renderedSections[i][3]}`).append(sectionDiv)
                }
            }
            if (!found) {
                document.getElementById(`${renderSection(theDisplaySectionValues[1], null, "decided", shoppingList, `noSection/${theDisplaySectionValues[1]}`)[3]}`).append(sectionDiv)
            }
        } else {
            document.getElementById("section-list").append(sectionDiv)
        }
    } else {
        document.getElementById("section-list").append(sectionDiv)
    }

    let found = false 
    let index = 0 
    for (let i = 0; i < openedSections.length; i++) {
        if (openedSections[i][0] == `${sectionName}-${shoppingList}-title`) {
            found = true 
            index = i 
        }
    }
    if (!found) {
        openedSections.push([`${sectionName}-${shoppingList}-title`, false, shoppingList])
        index = openedSections.length - 1
    }

    let toggleCounter = 0
    document.getElementById(`${sectionName}-${shoppingList}-title`).addEventListener("click", function() {
        if (toggleCounter % 2 == 0 ) {
            document.getElementById(`${sectionName}-${shoppingList}-title`).textContent = `▽ ${sectionName}`
            if (document.getElementById(`${sectionName}-${shoppingList}-items-list`).childNodes.length == 0) {
                document.getElementById(`${sectionName}-${shoppingList}-items-list`).className = "disappear"
            } else {
                document.getElementById(`${sectionName}-${shoppingList}-items-list`).className = "a-shopping-list"
            }
        
            if (document.getElementById(`${sectionName}-${shoppingList}-subsections`).childNodes.length == 0) {
                document.getElementById(`${sectionName}-${shoppingList}-subsections`).className = "disappear"
            } else {
                document.getElementById(`${sectionName}-${shoppingList}-subsections`).className = "indent-left"
            }  

            openedSections[index][1] = true

        } else {
            document.getElementById(`${sectionName}-${shoppingList}-title`).textContent = `▷ ${sectionName}`
            document.getElementById(`${sectionName}-${shoppingList}-subsections`).className = "disappear"
            document.getElementById(`${sectionName}-${shoppingList}-items-list`).className = "disappear"

            openedSections[index][1] = false
        }
        toggleCounter++
    })

    renderedSections.push([sectionName, `${sectionName}-${shoppingList}-items-list`, `${sectionName}-${shoppingList}-title`, `${sectionName}-${shoppingList}-subsections`])
    return [sectionName, `${sectionName}-${shoppingList}-items-list`, `${sectionName}-${shoppingList}-title`, `${sectionName}-${shoppingList}-subsections`]
}

function appendItemToShoppingListEl(input) {
    let itemID = input[0]
    let info = input[1]

    let itemValue = info.item
    let itemQuantity = info.quantity
    let itemNotes = info.notes
    let sectionValue = info.section
    let list = info.list

    if (list != currentList) {
        return
    }

    let newEl = document.createElement("li")
    if (Number(itemQuantity) != 0) {
        newEl.textContent += `${itemQuantity} | `
    }
    newEl.textContent += `${itemValue}`
    if (itemNotes != "") {
        newEl.textContent += ` 🗒️`
    }
    newEl.draggable = true


    let theDisplaySectionValues = getSectionValues(sectionValue)

    if (sectionValue == "noSection") {
        shoppingListEl.append(newEl)
    } else {
        let found = false
        for (let i = 0; i < renderedSections.length; i++) {
            if (renderedSections[i][0] == theDisplaySectionValues[0]) {
                document.getElementById(`${renderedSections[i][1]}`).append(newEl)
                found = true 
            }
        }
        if (!found) {
            document.getElementById(`${renderSection(theDisplaySectionValues[0], theDisplaySectionValues, null, list, sectionValue)[1]}`).append(newEl)
        }
    }




    let addToNewListInfo = []
    if (list == "shoppingList") {
        addToNewListInfo = ["Regular Items List", "regularList"]
    } else if (list == "regularList") {
        addToNewListInfo = ["Shopping List", "shoppingList"]
    }

    let el = document.createElement("div")
    el.innerHTML = `<div id='${itemID}' class='disappear'>
                        <h3 class='item-line'>${itemValue}</h3>
                        <h4 class='main-notes-section' id='${itemID}-note'>${itemNotes}</h4>
                        <div class='quantity-line'>
                            <button id='${itemID}-minus' class='quantity-adjuster'>-</button> <p id='${itemID}-quantity' >${itemQuantity}</p> <button id='${itemID}-add' class='quantity-adjuster'>+</button>
                        </div>
                        <div class='button-line'>
                            <button class='update-quantity' id='${itemID}-deleteBtn'>✍️</button>
                            <button class='add-shopping-list' id='${itemID}-regular-list'>Add to ${addToNewListInfo[0]}</button>
                            <button class='update-quantity' id='${itemID}-updateQuantity'>✓</button>
                        </div>
                    </div>`
    innerContainerEl.append(el)
    if (itemNotes == "") {
        document.getElementById(`${itemID}-note`).className = "disappear"
    }


    newEl.addEventListener("click", function() {

        for (let i = 0; i < shoppingListInfo.length; i++) {
            if (shoppingListInfo[i][1].list == currentList && itemID != shoppingListInfo[i][0]) {
                document.getElementById(shoppingListInfo[i][0]).className = "disappear"
            }
        }

        customSelectOptionsEl.className = "disappear"

        let currentClass = document.getElementById(`${itemID}`).className
        if (currentClass == "disappear") {
            document.getElementById(`${itemID}`).className = "bottom-bar"
            window.scrollTo({
                top: spaceBelowShoppingListsEl.offsetTop - 75,
                behaviour: 'smooth', 
            })
            window.scrollTo({
                top: newEl.offsetTop - 75,
                behaviour: 'smooth', 
            })
            // spaceBelowShoppingListsEl.hidden = false
            if (itemNotes == "") {
                spaceBelowShoppingListsEl.className = "space-bottom-less"
            } else {
                spaceBelowShoppingListsEl.className = "space-bottom"
            }
        } else {
            document.getElementById(`${itemID}`).className = "disappear"
            setTimeout(function() {
                spaceBelowShoppingListsEl.className = "disappear"
            }, 300)
        } 
    })

    document.getElementById(`${itemID}-minus`).addEventListener("click", function() {
        itemQuantity -= 1 
        if (itemQuantity < 0) {
            itemQuantity = 0
        }
        document.getElementById(`${itemID}-quantity`).textContent = itemQuantity
    })

    document.getElementById(`${itemID}-add`).addEventListener("click", function() {
        itemQuantity = Number(itemQuantity) + 1 
        if (itemQuantity > 99) {
            itemQuantity -= 1
        }
        document.getElementById(`${itemID}-quantity`).textContent = itemQuantity
    })

    document.getElementById(`${itemID}-regular-list`).addEventListener("click", function() {
        info.list = addToNewListInfo[1]
        info.quantity = document.getElementById(`${itemID}-quantity`).textContent

        push(shoppingListInDB, info)

        closeBottomBars()
        customSelectOptionsEl.className = "disappear"
    })

    document.getElementById(`${itemID}-updateQuantity`).addEventListener("click", function() {
        let updates = {
            "quantity": itemQuantity
        }

        update(ref(database, shoppingListName + "/" + itemID), updates)
        closeBottomBars()
        customSelectOptionsEl.className = "disappear"
    })

    document.getElementById(`${itemID}-deleteBtn`).addEventListener("click", function() {
        closeBottomBars()
        customSelectOptionsEl.className = "disappear"

        navigator.clipboard.writeText(itemValue)

        inputFieldEl.value = itemValue
        quantityFieldEl.value = itemQuantity
        notesAreaEl.value = itemNotes
        sectionSelectorEl.value = theDisplaySectionValues[0]
        sectionAdderEl.hidden = true 
        sectionAdderEl.value = ""
        
        if (itemNotes != "") {
            notesAreaEl.hidden = false 
        }

        let exactLocationOfItemInDB = ref(database, `${shoppingListName}/${itemID}`)
        remove(exactLocationOfItemInDB)

        let itemsInSection = false 
        for (let i = 0; i < shoppingListInfo.length; i++) {
            if (shoppingListInfo[i][1].list == currentList && getSectionValues(shoppingListInfo[i][1].section)[0] == theDisplaySectionValues[0]) {
                itemsInSection = true
            }
        }

        if (!itemsInSection) {
            for (let i = 0; i < openedSections.length; i++) {
                if (openedSections[i][0] === `${theDisplaySectionValues[0]}-${currentList}-title`) {
                    openedSections.splice(i, 1)
                }
            }
        }

        renderShoppingList()
    })

    newEl.addEventListener("dblclick", function() {
        document.getElementById(`${itemID}-deleteBtn`).click()
    })
}

function closeBottomBars() {
    for (let i = 0; i < shoppingListInfo.length; i++) {
        if (shoppingListInfo[i][1].list == currentList) {
            document.getElementById(`${shoppingListInfo[i][0]}`).className = "disappear"
        }
    }
    spaceBelowShoppingListsEl.className = "disappear"
}

function addSectionToSelector(section, ogSectionValue) {
    let optionFound = false

    for (let i = 0; i < sectionSelectorEl.length; i++) {
        if (sectionSelectorEl.options[i].value == section) {
            optionFound = true; 
        }
    }

    if (!optionFound) {
        let option = document.createElement("option")
        option.value = ogSectionValue
        option.textContent = section
        sectionSelectorEl.appendChild(option)
    }
}

function getSectionValues(sectionValue) {
    const segments = sectionValue.split('/').filter(Boolean)

    let returnArray = []
    let lastSegment = segments[segments.length - 1]
    let secondLastSegment = segments.length > 1 ? segments[segments.length -2] : ""

    returnArray.push(lastSegment.trim())
    returnArray.push(secondLastSegment.trim())

    return returnArray
}

infoImg.addEventListener("click", function() {

    closeBottomBars()
    customSelectOptionsEl.className = "disappear"

    mainSection.className = "disappear"
    infoSection.hidden = false
    sectionListSection.hidden = true 
    clearShoppingListEl()

    shoppingImg.hidden = true 
    regularImg.hidden = true 

    currentList = "infoSection"

    inputFieldEl.hidden = true 
    quantityFieldEl.hidden = true 
    addButtonEl.hidden = true 
    clearButtonEl.hidden = true 
    shoppingListEl.hidden = true 
    shoppingListTitle.hidden = true 

    notesToggleEl.hidden = true 
    notesAreaEl.hidden = true 
    selectWrapperEl.hidden = true
    sectionSelectorEl.value = "noSection"
    sectionAdderEl.hidden = true 
    sectionAddBtnEl.className = "disappear"
    

    regularListImg.hidden = true 
    shoppingListImg.hidden = true
    regularAccListImg.hidden = false
    shoppingAccListImg.hidden = false 
    infoImg.hidden = true 
})

regularListImg.addEventListener("click", function() {
    
    closeBottomBars()
    customSelectOptionsEl.className = "disappear"

    mainSection.className = ""
    infoSection.hidden = true 
    sectionListSection.hidden = false 
    clearShoppingListEl()

    shoppingImg.hidden = true 
    regularImg.hidden = false 

    shoppingListTitle.innerHTML = name + "'s Regular Items"
    currentList = "regularList"

    inputFieldEl.hidden = false 
    quantityFieldEl.hidden = false
    addButtonEl.hidden = false
    clearButtonEl.hidden = false
    shoppingListEl.hidden = false
    shoppingListTitle.hidden = false

    notesToggleEl.hidden = false 
    notesAreaEl.hidden = true
    selectWrapperEl.hidden = false
    sectionSelectorEl.value = "noSection"
    sectionAdderEl.hidden = true
    sectionAddBtnEl.className = "add-sect-btn"

    regularListImg.hidden = true 
    shoppingListImg.hidden = false 
    regularAccListImg.hidden = true
    shoppingAccListImg.hidden = true 
    infoImg.hidden = false

    renderShoppingList()
})

shoppingListImg.addEventListener("click", function() {

    closeBottomBars()
    customSelectOptionsEl.className = "disappear"

    mainSection.className = ""
    infoSection.hidden = true 
    sectionListSection.hidden = false 
    clearShoppingListEl()

    shoppingImg.hidden = false 
    regularImg.hidden = true 

    shoppingListTitle.innerHTML = name + "'s Shopping List"
    currentList = "shoppingList"

    inputFieldEl.hidden = false
    quantityFieldEl.hidden = false
    addButtonEl.hidden = false
    clearButtonEl.hidden = false
    shoppingListEl.hidden = false
    shoppingListTitle.hidden = false

    notesToggleEl.hidden = false
    notesAreaEl.hidden = true
    selectWrapperEl.hidden = false
    sectionSelectorEl.value = "noSection"
    sectionAdderEl.hidden = true
    sectionAddBtnEl.className = "add-sect-btn"

    regularListImg.hidden = false 
    shoppingListImg.hidden = true
    regularAccListImg.hidden = true
    shoppingAccListImg.hidden = true 
    infoImg.hidden = false 
    
    renderShoppingList()
})

regularAccListImg.addEventListener("click", function() {
    regularListImg.click()
})

shoppingAccListImg.addEventListener("click", function() {
    shoppingListImg.click()
})

shoppingListImg.click()