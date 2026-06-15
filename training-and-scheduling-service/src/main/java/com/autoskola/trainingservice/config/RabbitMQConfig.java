package com.autoskola.trainingservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "skola_exchange";
    public static final String QUEUE_FINANCE = "finance_queue";
    public static final String QUEUE_TRAINING = "training_queue";
    public static final String QUEUE_USER_REGISTERED = "user_registered_queue";
    public static final String QUEUE_VEHICLE_ASSIGNED = "training_vehicle_assigned_queue";
    public static final String QUEUE_INSTRUCTOR_AVAILABILITY = "training_instructor_availability_queue";
    public static final String QUEUE_USER_DELETED = "training_user_deleted_queue";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue userRegisteredQueue() { return new Queue(QUEUE_USER_REGISTERED, true); }

    @Bean
    public Binding userRegisteredBinding(Queue userRegisteredQueue, TopicExchange exchange) {
        return BindingBuilder.bind(userRegisteredQueue).to(exchange).with("user.registered");
    }

    @Bean public Queue financeQueue() { return new Queue(QUEUE_FINANCE); }

    @Bean public Queue trainingQueue() { return new Queue(QUEUE_TRAINING); }

    @Bean
    public Binding financeBinding(Queue financeQueue, TopicExchange exchange) {
        return BindingBuilder.bind(financeQueue).to(exchange).with("lesson.created");
    }

    @Bean
    public Binding trainingBinding(Queue trainingQueue, TopicExchange exchange) {
        return BindingBuilder.bind(trainingQueue).to(exchange).with("payment.*");
    }

    @Bean
    public Queue vehicleAssignedQueue() {
        return new Queue(QUEUE_VEHICLE_ASSIGNED, true);
    }

    @Bean
    public Binding vehicleAssignedBinding(TopicExchange exchange) {
        return BindingBuilder.bind(vehicleAssignedQueue())
                .to(exchange)
                .with("instructor.vehicle.assigned");
    }

    @Bean
    public Queue instructorAvailabilityQueue() {
        return new Queue(QUEUE_INSTRUCTOR_AVAILABILITY, true);
    }

    @Bean
    public Binding instructorAvailabilityBinding(TopicExchange exchange) {
        return BindingBuilder.bind(instructorAvailabilityQueue())
                .to(exchange)
                .with("instructor.availability.updated");
    }

    @Bean
    public Queue userDeletedQueue() {
        return new Queue(QUEUE_USER_DELETED, true);
    }

    @Bean
    public Binding userDeletedBinding(TopicExchange exchange) {
        return BindingBuilder.bind(userDeletedQueue())
                .to(exchange)
                .with("user.deleted");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}