// @flow
declare type ModerationConfig = {
  reportLength: number,
  onReportSentMessage: string,
  onReportErrorMessage: string,
  notificationDuration: number,
  moderateOptions: ModerateOption[],
  subtitle: string,
  tooltipMessage: string,
}
