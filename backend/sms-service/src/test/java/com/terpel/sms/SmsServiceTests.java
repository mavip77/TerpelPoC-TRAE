package com.terpel.sms;

import com.terpel.sms.core.SmsService;
import com.terpel.sms.model.PaymentRequest;
import com.terpel.sms.model.SecurityRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

public class SmsServiceTests {

  private SmsService service;

  @BeforeEach
  void setup() {
    service = new SmsService();
  }

  @Test
  void paymentRejectedDoesNotSend() {
    PaymentRequest req = new PaymentRequest();
    req.setTo("+573000000000");
    req.setAmount(10000);
    req.setStation("Estación A");
    req.setRef("ABC123");
    req.setStatus("Rechazado");
    assertFalse(service.sendPayment(req));
  }

  @Test
  void paymentAcceptedSends() {
    PaymentRequest req = new PaymentRequest();
    req.setTo("+573000000000");
    req.setAmount(20000);
    req.setStation("Estación A");
    req.setRef("ABC123");
    req.setStatus("Aceptado");
    boolean ok = service.sendPayment(req);
    assertTrue(ok);
  }

  @Test
  void securityNewDeviceSends() {
    SecurityRequest req = new SecurityRequest();
    req.setTo("+573000000000");
    req.setUserId("user-1");
    req.setDeviceId("dev-2");
    req.setKnownDeviceIds(Arrays.asList("dev-1"));
    boolean ok = service.sendSecurity(req);
    assertTrue(ok);
  }
}
