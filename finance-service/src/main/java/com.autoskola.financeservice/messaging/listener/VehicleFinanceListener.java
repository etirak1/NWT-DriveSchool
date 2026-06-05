package com.autoskola.financeservice.messaging.listener;

import com.autoskola.financeservice.config.RabbitMQConfig;
import com.autoskola.financeservice.messaging.dto.VehicleServicedMessage;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class VehicleFinanceListener {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_VEHICLE)
    public void handleVehicleServiced(VehicleServicedMessage msg) {
        System.out.println("[Finance] Servis vozila: " + msg.getVehiclePlate()
                + " | Trošak: " + msg.getRepairCost()
                + " | Datum: " + msg.getServiceDate());

        // Ovdje možeš sačuvati trošak u posebnoj tabeli VehicleExpense
        // vehicleExpenseRepository.save(new VehicleExpense(msg));
        // Za sada samo logiramo — dodaj tabelu kad budeš imao model
    }
}