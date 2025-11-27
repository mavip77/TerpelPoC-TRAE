package com.terpel.sms.model;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

public class SecurityRequest {
  @NotBlank
  private String to;
  @NotBlank
  private String userId;
  @NotBlank
  private String deviceId;
  @NotNull
  private List<String> knownDeviceIds;
  private boolean hasData;
  private boolean pushDelivered;
  private String message;

  public String getTo() { return to; }
  public void setTo(String to) { this.to = to; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getDeviceId() { return deviceId; }
  public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
  public List<String> getKnownDeviceIds() { return knownDeviceIds; }
  public void setKnownDeviceIds(List<String> knownDeviceIds) { this.knownDeviceIds = knownDeviceIds; }
  public boolean isHasData() { return hasData; }
  public void setHasData(boolean hasData) { this.hasData = hasData; }
  public boolean isPushDelivered() { return pushDelivered; }
  public void setPushDelivered(boolean pushDelivered) { this.pushDelivered = pushDelivered; }
  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
}
