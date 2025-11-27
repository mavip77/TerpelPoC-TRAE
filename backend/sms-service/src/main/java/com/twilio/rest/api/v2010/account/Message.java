package com.twilio.rest.api.v2010.account;

import com.twilio.type.PhoneNumber;

public class Message {
  private final String sid;
  private Message(String sid) { this.sid = sid; }
  public static Creator creator(PhoneNumber to, PhoneNumber from, String body) {
    return new Creator(to, from, body);
  }
  public String getSid() { return sid; }

  public static class Creator {
    private final PhoneNumber to;
    private final PhoneNumber from;
    private final String body;
    public Creator(PhoneNumber to, PhoneNumber from, String body) {
      this.to = to;
      this.from = from;
      this.body = body;
    }
    public Message create() {
      String sid = "SM" + Math.round(Math.random() * 1_000_000);
      return new Message(sid);
    }
  }
}

