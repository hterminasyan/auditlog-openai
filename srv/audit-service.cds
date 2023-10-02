using db from '../db/data-model';

service AuditService {
   
    entity AuditLogs as projection on db.AuditLogs;

    function triggerMailRefine() returns String;
    action triggerMailMapReduce() returns String;

}

