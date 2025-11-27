package com.terpel.sms.model;

public class InboxMessage {
  private String id;
  private String title;
  private String body;
  private String createdAt;
  private boolean read;
  private String deeplink;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public String getBody() { return body; }
  public void setBody(String body) { this.body = body; }
  public String getCreatedAt() { return createdAt; }
  public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
  public boolean isRead() { return read; }
  public void setRead(boolean read) { this.read = read; }
  public String getDeeplink() { return deeplink; }
  public void setDeeplink(String deeplink) { this.deeplink = deeplink; }
}

