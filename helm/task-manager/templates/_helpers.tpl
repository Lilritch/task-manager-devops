{{/*
Expand the chart name.
*/}}
{{- define "task-manager.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a full release name.
*/}}
{{- define "task-manager.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Chart label.
*/}}
{{- define "task-manager.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Shared labels.
*/}}
{{- define "task-manager.labels" -}}
helm.sh/chart: {{ include "task-manager.chart" . }}
app.kubernetes.io/name: {{ include "task-manager.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels for a component.
*/}}
{{- define "task-manager.selectorLabels" -}}
app.kubernetes.io/name: {{ include "task-manager.name" .root }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/*
Full labels for a component.
*/}}
{{- define "task-manager.componentLabels" -}}
{{ include "task-manager.labels" .root }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{- define "task-manager.backendName" -}}
backend
{{- end }}

{{- define "task-manager.frontendName" -}}
frontend
{{- end }}

{{- define "task-manager.postgresName" -}}
postgres
{{- end }}

{{- define "task-manager.appConfigName" -}}
app-config
{{- end }}

{{- define "task-manager.appSecretName" -}}
app-secret
{{- end }}

{{- define "task-manager.postgresSecretName" -}}
postgres-secret
{{- end }}
