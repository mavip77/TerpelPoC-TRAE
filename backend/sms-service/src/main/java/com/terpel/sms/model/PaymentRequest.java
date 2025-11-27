package com.terpel.sms.model;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class PaymentRequest {
  @NotBlank
  private String to;
  @NotNull
  private Integer amount;
  @NotBlank
  private String station;
  @NotBlank
  private String ref;
  @NotBlank
  private String status;
  private boolean hasData;
  private boolean pushDelivered;
  private String message;

  public String getTo() { return to; }
  public void setTo(String to) { this.to = to; }
  public Integer getAmount() { return amount; }
  public void setAmount(Integer amount) { this.amount = amount; }
  public String getStation() { return station; }
  public void setStation(String station) { this.station = station; }
  public String getRef() { return ref; }
  public void setRef(String ref) { this.ref = ref; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public boolean isHasData() { return hasData; }
  public void setHasData(boolean hasData) { this.hasData = hasData; }
  public boolean isPushDelivered() { return pushDelivered; }
  public void setPushDelivered(boolean pushDelivered) { this.pushDelivered = pushDelivered; }
  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
}
