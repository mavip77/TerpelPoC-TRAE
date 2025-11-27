package com.terpel.sms;

import com.terpel.sms.api.SmsController;
import com.terpel.sms.core.SmsService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = SmsController.class)
public class SmsControllerTests {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private SmsService smsService;

  @Test
  void paymentOkReturns200() throws Exception {
    Mockito.when(smsService.sendPayment(Mockito.any())).thenReturn(true);
    String json = "{\"to\":\"+573000000000\",\"amount\":20000,\"station\":\"Estación A\",\"ref\":\"ABC123\",\"status\":\"Aceptado\"}";
    mockMvc.perform(post("/api/sms/payment").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isOk());
  }

  @Test
  void paymentBadReturns400() throws Exception {
    Mockito.when(smsService.sendPayment(Mockito.any())).thenReturn(false);
    String json = "{\"to\":\"+573000000000\",\"amount\":20000,\"station\":\"Estación A\",\"ref\":\"ABC123\",\"status\":\"Aceptado\"}";
    mockMvc.perform(post("/api/sms/payment").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isBadRequest());
  }

  @Test
  void securityOkReturns200() throws Exception {
    Mockito.when(smsService.sendSecurity(Mockito.any())).thenReturn(true);
    String json = "{\"to\":\"+573000000000\",\"userId\":\"user-1\",\"deviceId\":\"dev-2\",\"knownDeviceIds\":[\"dev-1\"]}";
    mockMvc.perform(post("/api/sms/security").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isOk());
  }

  @Test
  void securityBadReturns400() throws Exception {
    Mockito.when(smsService.sendSecurity(Mockito.any())).thenReturn(false);
    String json = "{\"to\":\"+573000000000\",\"userId\":\"user-1\",\"deviceId\":\"dev-2\",\"knownDeviceIds\":[\"dev-1\"]}";
    mockMvc.perform(post("/api/sms/security").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isBadRequest());
  }

  @Test
  void transferSmsOkReturns200() throws Exception {
    Mockito.when(smsService.sendTransferSms(Mockito.any())).thenReturn(true);
    String json = "{\"to\":\"+573000000000\",\"amount\":20000,\"senderName\":\"Juan\",\"status\":\"Aceptado\"}";
    mockMvc.perform(post("/api/sms/transfer").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isOk());
  }
}
