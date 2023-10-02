using AuditService as service from '../../srv/audit-service';

annotate service.AuditLogs with @(UI: {

    LineItem                            : [
        {
            $Type                : 'UI.DataField',
            Label                : 'User',
            Value                : auditUser,
            ![@HTML5.CssDefaults]: {width: '20%'},

        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Time',
            Value                : timestamp,
            ![@HTML5.CssDefaults]: {width: '20%'}

        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Message',
            Value                : message,
            ![@HTML5.CssDefaults]: {width: '40%'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Category',
            Value                : category,
            ![@HTML5.CssDefaults]: {width: '20%'}
        },
        {
            $Type : 'UI.DataFieldForAction',
            Label : 'Mail summary',
            Action: 'AuditService.EntityContainer/triggerMailMapReduce',
        },
    ],

    SelectionFields                     : [
        timestamp,
        category
    ],


    // Facets for additional object header information (shown in the object page header)
    HeaderFacets                        : [{
        $Type : 'UI.ReferenceFacet',
        Target: '@UI.FieldGroup#HeaderGeneralInformation'
    }],

    FieldGroup #HeaderGeneralInformation: {Data: [
        {
            $Type: 'UI.DataField',
            Label: 'User',
            Value: auditUser,

        },
        {
            $Type: 'UI.DataField',
            Label: 'Time',
            Value: timestamp,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Category',
            Value: category,
        },
    ]},

    FieldGroup #MessageDetails          : {
        $Type: 'UI.FieldGroupType',

        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Message',
                Value: message,

            },
            {
                $Type: 'UI.DataField',
                Label: 'GPT Message',
                Value: gptMessage,


            }
        ],
    },


    Facets                              : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'MessageDetails',
        Label : 'General Information',
        Target: '@UI.FieldGroup#MessageDetails',


    }, ]
});


annotate service.AuditLogs with {
    @Common.Label                   : 'Category'
    @Common.ValueListWithFixedValues: true
    @Common.ValueList               : {
        DistinctValuesSupported: true,
        Label                  : 'Category',
        CollectionPath         : 'AuditLogs',
        Parameters             : [{
            $Type            : 'Common.ValueListParameterFilterOnly',
            ValueListProperty: 'category',
        }]
    }
    category
};


annotate service.AuditLogs with {
    @Common.Label: 'Time'
    timestamp
};
