jQuery.sap.declare("com.sap.kelley.tea.Descriptor");
jQuery.sap.require("com.sap.kelley.tea.Service");

sap.ui.core.Element.extend("com.sap.kelley.tea.Descriptor", {

	metadata : {
		publicMethods : ["unloadApplication", "openApplication", "getService"]
	}
});

com.sap.kelley.tea.Descriptor.prototype.init = function() {
    // localisation
    this.oBundle = jQuery.sap.resources({url : "resources/com/sap/kelley/tea/l10n/TravelExpenseApproval.properties"});

//		//services
		this.oService = new com.sap.kelley.tea.Service();
	
 		//this.oService.getSummary(false);

    // inbox metadata
    this.applicationName = this.oBundle.getText('DISPLAY_NAME');
    this.setModel(new sap.ui.model.json.JSONModel({
        newItemCount:13,
        itemCount:200,
        applicationIcon:"resources/com/sap/kelley/tea/img/Application_Icon.png",
        showBusyIndicator:false
    }));


    // eventing
    this.eventChannel = "com.sap.kelley.tea";
    this.onTravelSelectEvent = "onTravelSelectEvent";
};

com.sap.kelley.tea.Descriptor.prototype.unloadApplication = function () {
	jQuery.sap.excludeStyleSheet("travelExpenseApprovalCSS");
};

com.sap.kelley.tea.Descriptor.prototype.openApplication = function () {
	jQuery.sap.includeStyleSheet("resources/com/sap/kelley/tea/css/tea.css", "travelExpenseApprovalCSS");
	sap.ui.getCore().getEventBus().publish("nav", "to", {
		viewId : "Empty",
		viewPackage : "com.sap.kelley.tea.views",
		viewName : "Empty",
		options : {navType : "detail", cssClass : "teaDetailsMainContainer"}
	});

	sap.ui.getCore().getEventBus().publish("nav", "to", {
		viewId : "Home",
		viewPackage : "com.sap.kelley.tea.views",
		viewName : "Home",
		options : {navType : "master", cssClass : "teaDetailsMainContainer"}
	});
	
};

com.sap.kelley.tea.Descriptor.prototype.getService = function () {
	return this.oService;
};
