using { cuid } from '@sap/cds/common';
namespace db;


@Capabilities : {
   FilterRestrictions : {
      FilterExpressionRestrictions :
         [{
            Property : 'timestamp',
            AllowedExpressions : 'SingleRange'
         }]
      }
}
entity AuditLogs: cuid {
  timestamp: Timestamp;
  auditUser: String;
  message : LargeString;
  gptMessage: LargeString;
  category: String 
}