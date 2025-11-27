package com.terpel.sms.api;

import com.terpel.sms.core.SmsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SmsController.class)
class SmsControllerTests {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private SmsService smsService;

  @Test
  void transferAceptadoReturnsOk() throws Exception {
    when(smsService.sendTransferSms(any())).thenReturn(true);
    String body = "{\"to\":\"+573000000000\",\"amount\":1000,\"senderName\":\"Juan\",\"status\":\"Aceptado\"}";
    mockMvc.perform(
        post("/api/sms/transfer")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body)
    ).andExpect(status().isOk());
  }

  @Test
  void transferRechazadoReturnsBadRequest() throws Exception {
    when(smsService.sendTransferSms(any())).thenReturn(false);
    String body = "{\"to\":\"+573000000000\",\"amount\":1000,\"senderName\":\"Juan\",\"status\":\"Rechazado\"}";
    mockMvc.perform(
        post("/api/sms/transfer")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body)
    ).andExpect(status().isBadRequest());
  }
}

