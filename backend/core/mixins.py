from .models import AuditLog

class AuditLogMixin:
    """
    Mixin to log creates, updates, and deletes.
    Classes using this must inherit from viewsets.GenericViewSet (or ModelViewSet).
    """

    def perform_create(self, serializer):
        instance = serializer.save()
        self._log_action('CREATE', instance)
        return instance

    def perform_update(self, serializer):
        instance = serializer.save()
        self._log_action('UPDATE', instance)
        return instance

    def perform_destroy(self, instance):
        # Log before delete regarding the object ID, saving state if needed
        self._log_action('DELETE', instance)
        instance.delete()

    def _log_action(self, action, instance):
        try:
            user = self.request.user if self.request.user.is_authenticated else None
            model_name = instance._meta.model_name
            object_id = str(instance.pk)
            
            AuditLog.objects.create(
                actor=user,
                action=action,
                target_model=model_name,
                target_object_id=object_id,
                details={}, # Can extend to capture diffs
                ip_address=self._get_client_ip()
            )
        except Exception as e:
            # Fallback to prevent blocking main action if logging fails
            print(f"Audit log failed: {e}")

    def _get_client_ip(self):
        try:
            x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = self.request.META.get('REMOTE_ADDR')
            return ip
        except:
            return None
