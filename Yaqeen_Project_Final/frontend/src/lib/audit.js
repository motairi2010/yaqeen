import { supabase } from './supabase';

export async function logEvent(eventType, action, details = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const auditLog = {
      event_type: eventType,
      user_id: user?.id || null,
      entity_type: details.entityType || null,
      entity_id: details.entityId || null,
      action: action,
      old_data: details.oldData || null,
      new_data: details.newData || null,
      ip_address: null,
      user_agent: navigator.userAgent || null,
      metadata: details.metadata || {}
    };

    const { error } = await supabase
      .from('audit_logs')
      .insert([auditLog]);

    if (error) {
      console.error('Error logging audit event:', error);
    }
  } catch (error) {
    console.error('Error in logEvent:', error);
  }
}

export async function getAuditLogs(filters = {}) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAuditLogs:', error);
    return [];
  }
}

export async function exportAuditLogs(filters = {}) {
  try {
    const logs = await getAuditLogs(filters);

    const csv = [
      ['التاريخ', 'نوع الحدث', 'الإجراء', 'نوع الكيان', 'معرف الكيان', 'المستخدم'].join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString('ar-SA'),
        log.event_type,
        log.action,
        log.entity_type || '',
        log.entity_id || '',
        log.user_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  } catch (error) {
    console.error('Error exporting audit logs:', error);
  }
}
