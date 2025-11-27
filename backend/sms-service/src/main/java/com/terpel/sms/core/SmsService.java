package com.terpel.sms.core;

import com.terpel.sms.model.TransferSmsRequest;
import com.terpel.sms.model.PaymentRequest;
import com.terpel.sms.model.SecurityRequest;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {
  @Value("${twilio.accountSid:}")
  private String accountSid;
  @Value("${twilio.authToken:}")
  private String authToken;
  @Value("${twilio.fromNumber:+15005550006}")
  private String fromNumber;

  private volatile boolean initialized = false;

  private void ensureInit() {
    if (!initialized) {
      if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty()) {
        Twilio.init(accountSid, authToken);
      }
      initialized = true;
    }
  }

  public boolean sendTransferSms(TransferSmsRequest req) {
    if (!"Aceptado".equals(req.getStatus())) {
      return false;
    }
    ensureInit();
    String body = req.getMessage() != null && !req.getMessage().isEmpty()
        ? req.getMessage()
        : String.format("Recibiste $%s de %s.", req.getAmount(), req.getSenderName());
    if (accountSid == null || accountSid.isEmpty() || authToken == null || authToken.isEmpty()) {
      return true;
    }
    try {
      Message m = Message.creator(new PhoneNumber(req.getTo()), new PhoneNumber(fromNumber), body).create();
      return m != null && m.getSid() != null;
    } catch (Exception e) {
      return false;
    }
  }

  public boolean sendPayment(PaymentRequest req) {
    if (!"Aceptado".equals(req.getStatus())) {
      return false;
    }
    ensureInit();
    String content = req.getMessage() != null && !req.getMessage().isEmpty()
        ? req.getMessage()
        : String.format(
            "Pago exitoso por $%s en Terpel %s. Ref: %s.",
            Math.abs(req.getAmount()), req.getStation(), req.getRef());
    if (accountSid == null || accountSid.isEmpty() || authToken == null || authToken.isEmpty()) {
      return true;
    }
    try {
      Message m = Message.creator(new PhoneNumber(req.getTo()), new PhoneNumber(fromNumber), content).create();
      return m != null && m.getSid() != null;
    } catch (Exception e) {
      return false;
    }
  }

  public boolean sendSecurity(SecurityRequest req) {
    boolean isNewDevice = req.getKnownDeviceIds() == null || !req.getKnownDeviceIds().contains(req.getDeviceId());
    if (!isNewDevice) {
      return false;
    }
    ensureInit();
    String content = req.getMessage() != null && !req.getMessage().isEmpty()
        ? req.getMessage()
        : String.format("Alerta seguridad: inicio de sesión desde dispositivo nuevo. ID: %s.", req.getDeviceId());
    if (accountSid == null || accountSid.isEmpty() || authToken == null || authToken.isEmpty()) {
      return true;
    }
    try {
      Message m = Message.creator(new PhoneNumber(req.getTo()), new PhoneNumber(fromNumber), content).create();
      return m != null && m.getSid() != null;
    } catch (Exception e) {
      return false;
    }
  }
}
