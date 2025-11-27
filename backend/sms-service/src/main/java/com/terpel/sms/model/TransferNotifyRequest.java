package com.terpel.sms.model;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class TransferNotifyRequest {
  @NotBlank
  private String userId;
  @NotNull
  private Integer amount;
  @NotBlank
  private String senderName;
  @NotBlank
  private String status;

  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public Integer getAmount() { return amount; }
  public void setAmount(Integer amount) { this.amount = amount; }
  public String getSenderName() { return senderName; }
  public void setSenderName(String senderName) { this.senderName = senderName; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
}
