sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ui/test/integration/FirstJourney',
		'ui/test/integration/pages/AuditLogsList',
		'ui/test/integration/pages/AuditLogsObjectPage'
    ],
    function(JourneyRunner, opaJourney, AuditLogsList, AuditLogsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ui') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheAuditLogsList: AuditLogsList,
					onTheAuditLogsObjectPage: AuditLogsObjectPage
                }
            },
            opaJourney.run
        );
    }
);