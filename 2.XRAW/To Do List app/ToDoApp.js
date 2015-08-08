var INPUT_FIELD_NAME = "toDoItem";
var LIST_NAME = "toDoList";
var COMPLETED_LIST_NAME = "completedList";

function handleOnKey(event) {
	if(event.keyCode==13) {
		App.DataManager.addListItem();
		var list = document.getElementById("toDoList");
		var listItems = list.getElementsByTagName("li");
		App.SaveData.saveToDoList(listItems);
		App.DataManager.clearText();
	}
}

var App = {
	PageNavigator : {
		page2 : function () {
			var calCon = document.getElementById("calendarContainer");
			document.body.removeChild(calCon);
			App.PageCreator.page2();
		},
		page1 : function () {
			var todoCon = document.getElementById("toDoContainer");
			document.body.removeChild(todoCon);
			App.PageCreator.page1();
		}
	},

	PageCreator : {

		page1 : function () {
			var calendarContainer = document.createElement("div");
			calendarContainer.id = "calendarContainer";

			var calendar = document.createElement("table");
			calendar.border = "1";

			function daysInMonth(iMonth, iYear) { 
				return 32 - new Date(iYear, iMonth, 32).getDate();
			}
			var date = new Date(), y = date.getFullYear(), m = date.getMonth();
			var firstDay = new Date(y, m, 1);
			
			for (var i=0 ; i<6 ; i++) {
				var num = 1;
				var calendarRow = document.createElement("tr");
				if(i==0) {
					for (var j=0 ; j<7 ; j++) {
						var calendarHead = document.createElement("th");
						calendarHead.innerText = "day";
						calendarRow.appendChild(calendarHead);
					}
				}	
				else {
					for (var j=0 ; j<7 ; j++) {
						var calendarCol = document.createElement("td");
						calendarRow.appendChild(calendarCol);
					}	
				}
				
				calendar.appendChild(calendarRow);
			}

			var month = [];
			for (var i = 0; i < daysInMonth(m, y); i++) {
				month[i] = i+1;
			};

			var nextButton = document.createElement("input");
			nextButton.type = "button";
			nextButton.value = "Next";
			nextButton.onclick = App.PageNavigator.page2;

			calendarContainer.appendChild(calendar);
			calendarContainer.appendChild(nextButton);
			document.body.appendChild(calendarContainer);
			
		},

		page2 : function () {
			var toDoContainer = document.createElement("div");
			toDoContainer.id = "toDoContainer";
			var toDoTitle = document.createElement("h1");
			toDoTitle.innerText = "ToDo List";
			var enterItemLabel = document.createElement("div");
			enterItemLabel.innerText = "Enter ToDo Item:";
			enterItemLabel.style = "display:block";
			var enterItemField = document.createElement("input");
			enterItemField.type = "text";
			enterItemField.id = "toDoItem";
			enterItemField.onkeypress = handleOnKey;
			var clearButton = document.createElement("input");
			clearButton.type = "button";
			clearButton.value = "Clear All";
			clearButton.onclick = App.DataManager.clearAll;
			var toDoListTitle = document.createElement("h3");
			toDoListTitle.innerText = "Things to do";
			var toDoListContainer = document.createElement("ul");
			toDoListContainer.id = "toDoList";
			var completedListTitle = document.createElement("h3");
			completedListTitle.innerText = "Tasks Completed";
			var completedListContainer = document.createElement("ul");
			completedListContainer.id = "completedList";
			var backButton = document.createElement("input");
			backButton.type = "button";
			backButton.value = "Back";
			backButton.onclick = App.PageNavigator.page1;
			
			toDoContainer.appendChild(toDoTitle);
			toDoContainer.appendChild(enterItemLabel);
			toDoContainer.appendChild(enterItemField);
			toDoContainer.appendChild(clearButton);
			toDoContainer.appendChild(toDoListTitle);
			toDoContainer.appendChild(toDoListContainer);
			toDoContainer.appendChild(completedListTitle);
			toDoContainer.appendChild(completedListContainer);
			toDoContainer.appendChild(backButton);

			document.body.appendChild(toDoContainer);
			App.LoadData.appendLists();


		}
	},

	DataManager : {

		getText : function () {
			var textNode = document.getElementById(INPUT_FIELD_NAME);
			if(textNode) {
				var taskText = textNode.value;	
				return taskText;
			}
			return null;
		},

		addListItem : function () {
			var list = document.getElementById(LIST_NAME);
			var listItem = document.createElement("li");

			var input = App.DataManager.getText();
			listItem.innerText = input;

			//get list elements
			var listItems = list.getElementsByTagName("li");
			var listLength = listItems.length;
			if(listLength > 0) {
				var firstItem = list.firstChild;
				list.insertBefore(listItem, firstItem);
			}
			else {
				list.appendChild(listItem);
			}

			//add checkbox
			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			listItem.appendChild(checkbox);
			checkbox.onclick = function(clickEvent) {
				App.DataManager.moveCompletedItem(listItem);
			}	

			//add edit button
			var edit = document.createElement("input");
			edit.type = "button";
			edit.value = "edit";
			edit.onclick = function(clickEvent) {
				App.DataManager.editEntry(listItem);
			}	
			listItem.appendChild(edit);

			return listItem;
		},

		moveCompletedItem : function (completedItem) {
			var completedList = document.getElementById(COMPLETED_LIST_NAME);
			completedItem.removeChild(completedItem.lastChild);
			completedList.appendChild(completedItem);
			var completedItems = completedList.getElementsByTagName("li");
			App.SaveData.saveCompletedList(completedItems);
			var list = document.getElementById("toDoList");
			var listItems = list.getElementsByTagName("li");
			App.SaveData.saveToDoList(listItems);
		},

		//in progress
		editEntry : function (listItem) {
			var entry = listItem.firstChild.nodeValue;
			listItem.removeChild(listItem.firstChild);
			var editable = document.createElement("input");
			editable.type = "text";
			editable.value = entry;
			listItem.insertBefore(editable, listItem.firstChild);

			var saveButton = document.createElement("input");
			saveButton.type = "button";
			saveButton.value = "save";

			listItem.removeChild(listItem.lastChild);
			listItem.appendChild(saveButton);

			saveButton.onclick = function(clickEvent) {
				var editedEntry = document.createElement("text");
				editedEntry.innerHTML = listItem.firstChild.value;
				listItem.removeChild(listItem.firstChild);
				listItem.insertBefore(editedEntry, listItem.firstChild);
				var edit = document.createElement("input");
				edit.type = "button";
				edit.value = "edit";
				edit.onclick = function(clickEvent) {
					App.DataManager.editEntry(listItem);
				}	
				listItem.removeChild(listItem.lastChild);
				listItem.appendChild(edit);

				var list = document.getElementById(LIST_NAME);
				var listItems = list.getElementsByTagName("li");
				App.SaveData.saveToDoList(listItems);

			}
		},

		clearText : function () {
			var textField = document.getElementById(INPUT_FIELD_NAME);
			textField.value = "";
		},

		createTodoTask : function (briefDescription, isChecked) {
				var aTodoTask = {};
				aTodoTask.briefDescription = briefDescription;
				aTodoTask.isCompleted = isChecked;
				return aTodoTask;
		},

		clearAll : function () {
			localStorage.clear();
			location.reload();
		}
	},

	SaveData : {
		saveToDoList : function (listItems) {
			var savedList = [];
			for (var i = 0; i < listItems.length; i++) {
				var taskTitle = listItems[i].innerText;
				var taskChecked = listItems[i].firstElementChild.checked;
				var editButton = listItems[i].lastElementChild;
				var aTodoTask = App.DataManager.createTodoTask(taskTitle, taskChecked);
				savedList[i] = aTodoTask;
				console.log(savedList);

			}
			localStorage.setItem('savedList', JSON.stringify(savedList));
			console.log(JSON.stringify(savedList));
		},

		saveCompletedList : function (completedItems) {
			var completedList = [];
			for (var i = 0; i < completedItems.length; i++) {
				var completedTitle = completedItems[i].innerText;
				var aTodoTask = App.DataManager.createTodoTask(completedTitle, true);
				completedList[i] = aTodoTask;
				localStorage.setItem('completedList', JSON.stringify(completedList));
			}
		}
	},

	LoadData : {
		loadLists : function () {
			var loadedTaskList = localStorage.getItem('savedList');
			var loadedCompletedList = localStorage.getItem('completedList');
			if (loadedCompletedList!=null){
				loadedCompletedList = loadedCompletedList.split(",");
			}
			if (loadedTaskList!=null){
				loadedTaskList = loadedTaskList.split(",");
			}
			var toDoListData = JSON.parse(loadedTaskList);	
			var doneToDoListData = JSON.parse(loadedCompletedList);
			return [toDoListData, doneToDoListData];
		},

		appendLists : function (){
			var loadedLists = this.loadLists();
			var toDoListData = loadedLists[0];
			var doneToDoListData = loadedLists[1];

			var list = document.getElementById(LIST_NAME);
			var completedList = document.getElementById(COMPLETED_LIST_NAME);
			
			if (toDoListData) {
				for (var i = 0; i < toDoListData.length; i++){
					var listItem = document.createElement("li");
					listItem.innerText = toDoListData[i].briefDescription;
					list.appendChild(listItem);
					var aCheckmark = document.createElement("input");
					aCheckmark.type = "checkbox";
					listItem.appendChild(aCheckmark);
					var edit = document.createElement("input");
					edit.type = "button";
					edit.value = "edit";
					listItem.appendChild(edit);
				}
			}
			
			if (doneToDoListData) {
				for (var i = 0; i < doneToDoListData.length; i ++){
					var checkedItem = document.createElement("li");
					checkedItem.innerText = doneToDoListData[i].briefDescription;
					completedList.appendChild(checkedItem);
				}
			}

			// Assign an event handler to every check mark in the todo list items.
			var listItems = list.getElementsByTagName("li");
			if (listItems.length) {
				for (var i = 0; i < listItems.length; i++) {
					var checkbox = listItems[i].lastChild.previousSibling;
					var editbutton = listItems[i].lastChild;

					checkbox.onclick = function () {
						App.DataManager.moveCompletedItem(this.parentElement);
					}
					editbutton.onclick = function() {
						App.DataManager.editEntry(this.parentElement);
					}

				}
			}

			
			
		}
	},

	run: function () {
		this.PageCreator.page1();
	}
};

App.run();