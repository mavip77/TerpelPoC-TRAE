package com.terpel.sms.model;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class TransferSmsRequest {
  @NotBlank
  private String to;
  @NotNull
  private Integer amount;
  @NotBlank
  private String senderName;
  @NotBlank
  private String status;
  private String message;

  public String getTo() { return to; }
  public void setTo(String to) { this.to = to; }
  public Integer getAmount() { return amount; }
  public void setAmount(Integer amount) { this.amount = amount; }
  public String getSenderName() { return senderName; }
  public void setSenderName(String senderName) { this.senderName = senderName; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
}
