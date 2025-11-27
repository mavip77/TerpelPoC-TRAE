package com.terpel.sms.model;

import java.util.List;

public class InboxPage {
  private List<InboxMessage> items;
  private String nextCursor;

  public List<InboxMessage> getItems() { return items; }
  public void setItems(List<InboxMessage> items) { this.items = items; }
  public String getNextCursor() { return nextCursor; }
  public void setNextCursor(String nextCursor) { this.nextCursor = nextCursor; }
}

