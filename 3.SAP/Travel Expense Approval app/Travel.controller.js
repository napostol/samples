sap.ui
		.controller(
				"com.sap.kelley.tea.controllers.details.Travel",
				{
					onInit : function() {
						
						console.log(this.getView());
			
						var sId = this.getView().sId;  					// Just 4 dev
						sId = sId.replace("detailTravel_","");			//
						this.mysId = sId = sId.replace("Detail","");	//
						
						this.oDescriptor = com.sap.kelley.getAppContainer().getDescriptor("Travel Expense Approve");
						
						//Binding oDataModel
						this.oDataModel = this.oDescriptor.getService().getDetails(jQuery.proxy(this.onDataLoaded, this),this.mysId,true);
						this.oDataModel2 = this.oDescriptor.getService().getReceiptsCollection(jQuery.proxy(this.onDataLoadedReceipts, this),this.mysId,true);
						
					},
					
					onDataLoaded: function (oData, oResponseData) {
						var model = new sap.ui.model.json.JSONModel(oData.data);
						this.getView().setModel(model,"TravelExpenseApproval_Worklist");
					},
					
					onDataLoadedReceipts: function (oData, oResponseData) {	
						var model = new sap.ui.model.json.JSONModel(oData.data);	
						this.getView().setModel(model,"TravelExpenseApproval_WorklistReceipt");
						sap.ui.getCore().setModel(model,"TravelExpenseApproval_WorklistReceipt");
					},

					onNavButtonTap : function() {
						sap.ui.getCore().getEventBus().publish("nav", "back");
					},

					onBeforeFirstShow : function(oEvent) {
						if (oEvent.data.title) {
							this.getView().page.setTitle(oEvent.data.title);
						}

						if (oEvent.data.bindingContext) {
							this.getView().setBindingContext(
									oEvent.data.bindingContext);
						}
					},

					showPopoverDialog : function(oEvent) {
						var oSource = oEvent.getSource();

						if (jQuery.device.is.phone) {
							var dialog = this.getView().byId(
									oSource.data("dialog"));
							dialog.open();
						} else {

							var popover = this.getView().byId(
									oSource.data("popover"));
							//popover.setPlacement(sap.m.PlacementType.Top);
							popover.openBy(oEvent.getSource());
						}
					},

					hidePopoverDialog : function(oEvent) {
						var oSource = oEvent.getSource();

						if (jQuery.device.is.phone) {
							var dialog = this.getView().byId(
									oSource.data("dialog"));
							dialog.close();
						} else {
							var popover = this.getView().byId(
									oSource.data("popover"));
							popover.close();
						}
					},

					onListSelect : function(oEvent) {

						
						var oBindingContexts = oEvent.getParameter("listItem").oBindingContexts;

						var sViewId = "detailWorkListItemDetail_"
								+  oEvent.getParameter("listItem").data("id");

						sap.ui.getCore().getEventBus().publish("nav", "to", {
							viewName : "WorkListItemDetail",
							viewPackage : "com.sap.kelley.tea.views",
							viewId : sViewId,
							options : {
								navType : "detail",
								showMaster: true,
								data : {
									bindingContexts : oBindingContexts
								}
							}
						});
					},

					onListItemTap : function(oEvent) {
						sap.ui.getCore().getEventBus().publish("nav", "back");
					},

					onNavButtonTag : function() {
						sap.ui.getCore().getEventBus().publish("nav", "back");
					},

					onPageSwipeRight : function() {
						// Here we have a jquery-mobile bug, see:
						// http://forum.jquery.com/topic/double-event-firing-on-swipeleft-and-swiperight-events
						if (!this.workaroundSwipeEvent())
							return false;
						// Workaround End

						jQuery.sap.log.debug("Swipe Page to prev ListItem.");
						var oBindingContext = this.getView().getBindingContext(
								"TravelExpenseApproval_Worklist");
						var path = oBindingContext.getPath();
						var iLastBackslashIndex = path.lastIndexOf("/");
						var iPrevItemIndex = (parseInt(path
								.substring(iLastBackslashIndex + 1)) - 1);
						// abort if index is lower than 0
						if (iPrevItemIndex < 0) {
							return false;
						}
						var sPrevPath = path.substring(0, iLastBackslashIndex)
								+ "/" + iPrevItemIndex;
						var oPrevItem = oBindingContext.getModel().getContext(
								sPrevPath);
						this.pageSwipeTo(oPrevItem, "back");
						return false;
					},

					onPageSwipeLeft : function() {
						// Here we have a jquery-mobile bug, see:
						// http://forum.jquery.com/topic/double-event-firing-on-swipeleft-and-swiperight-events
						if (!this.workaroundSwipeEvent())
							return false;
						// Workaround End
							
						jQuery.sap.log.debug("Swipe Page to next ListItem.");
						var oBindingContext = this.getView().getBindingContext(
								"TravelExpenseApproval_Worklist");
						var path = oBindingContext.getPath();
						var iLastBackslashIndex = path.lastIndexOf("/");
						var iNextItemIndex = (parseInt(path
								.substring(iLastBackslashIndex + 1)) + 1);
						var sNextPath = path.substring(0, iLastBackslashIndex)
								+ "/" + iNextItemIndex;
						var oNextItem = oBindingContext.getModel().getContext(
								sNextPath);
						this.pageSwipeTo(oNextItem, "to");
						return false;
					},

					pageSwipeTo : function(oItem, sTransitionDirection) {
						if (oItem) {
							var sViewId = "detailTravel_"
									+ oItem.getProperty("TravelExpenseApproval_Worklist>content/m:properties/d:workitem_id");

							sap.ui
									.getCore()
									.getEventBus()
									.publish(
											"nav",
											"to",
											{
												viewName : "Travel",
												viewPackage : "com.sap.kelley.tea.views",
												viewId : sViewId,
												options : {
													navType : "detail",
													showMaster: true,
													data : {
														bindingContexts : {
															"entries" : oItem
														}
													},
												},
												transitionDirection : sTransitionDirection
											});
						}
					},
					
					
					onBeforeRendering : function(oEvent) {
						var oPage = this.getView().byId("oTravelPage");
						oPage.attachBrowserEvent("swiperight",
								this.onPageSwipeRight, this);
						oPage.attachBrowserEvent("swipeleft",
								this.onPageSwipeLeft, this);

						var oCreatorNameText = this.getView().byId(
								"oCreatorNameText");
						
						console.log(oEvent);

					},

					workaroundSwipeEvent : function() {
						if (this.lockSwipeEvent)
							return false;

						var that = this;
						this.lockSwipeEvent = true;
						setTimeout(function() {
							that.lockSwipeEvent = false;
						}, 0);
						return true;
					},
					
					onApprove : function(oEvent){
						var oSource = oEvent.getSource();
						var id=oSource.data("id");
						console.log("###Approve: "+id);
						//this.oDescriptor.getService().approveExpense(id);
						this.hidePopoverDialog(oEvent);
					},
					
					onDecline : function(oEvent){
						var oSource = oEvent.getSource();
						var id=oSource.data("id");
						var comment = "Has to be set";
						console.log("###DECLINE: "+id);
						//this.oDescriptor.getService().declineExpense(id,comment);				
						this.hidePopoverDialog(oEvent);
					},
					

				});
