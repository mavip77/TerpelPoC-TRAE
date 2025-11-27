package com.terpel.sms.core;

import com.terpel.sms.model.PaymentRequest;
import com.terpel.sms.model.SecurityRequest;
import com.terpel.sms.model.TransferSmsRequest;
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

  private void ensureInit() {
    if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty()) {
      Twilio.init(accountSid, authToken);
    }
  }

  public boolean sendPayment(PaymentRequest req) {
    if (!"Aceptado".equals(req.getStatus())) {
      return false;
    }
    if (req.isHasData() && req.isPushDelivered()) {
      return false;
    }
    ensureInit();
    String body = req.getMessage() != null && !req.getMessage().isEmpty()
        ? req.getMessage()
        : String.format("Pago exitoso por $%s en Terpel %s. Ref: %s.", req.getAmount(), req.getStation(), req.getRef());
    try {
      Message m = Message.creator(new PhoneNumber(req.getTo()), new PhoneNumber(fromNumber), body).create();
      return m != null && m.getSid() != null;
    } catch (Exception e) {
      return false;
    }
  }

  public boolean sendSecurity(SecurityRequest req) {
    boolean isNewDevice = !req.getKnownDeviceIds().contains(req.getDeviceId());
    if (!isNewDevice) {
      return false;
    }
    if (!(req.isHasData() == false || req.isPushDelivered() == false)) {
      return false;
    }
    ensureInit();
    String body = req.getMessage() != null && !req.getMessage().isEmpty()
        ? req.getMessage()
        : String.format("Alerta seguridad: inicio de sesión desde dispositivo nuevo. ID: %s.", req.getDeviceId());
    try {
      Message m = Message.creator(new PhoneNumber(req.getTo()), new PhoneNumber(fromNumber), body).create();
      return m != null && m.getSid() != null;
    } catch (Exception e) {
      return false;
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
    try {
      Message m = Message.creator(new PhoneNumber(req.getTo()), new PhoneNumber(fromNumber), body).create();
      return m != null && m.getSid() != null;
    } catch (Exception e) {
      return false;
    }
  }
}
