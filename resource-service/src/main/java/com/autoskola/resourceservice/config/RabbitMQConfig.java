package com.autoskola.resourceservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "skola_exchange";

    public static final String QUEUE_USER_REGISTERED = "user_registered_resource_queue";
    public static final String QUEUE_USER_DELETED = "user_deleted_resource_queue";
    public static final String QUEUE_REPAIR_CREATED = "repair_created_queue";
    public static final String QUEUE_REPAIR_UPDATED = "repair_updated_queue";
    public static final String QUEUE_REPAIR_DELETED = "repair_deleted_queue";
    public static final String QUEUE_VEHICLE_CREATED = "vehicle_created_queue";
    public static final String QUEUE_VEHICLE_UPDATED = "vehicle_updated_queue";
    public static final String QUEUE_VEHICLE_DELETED = "vehicle_deleted_queue";
    public static final String QUEUE_INSTRUCTOR_AVAILABILITY = "instructor_availability_queue";
    public static final String QUEUE_VEHICLE_ASSIGNED = "resource_vehicle_assigned_queue";

    @Bean public TopicExchange skolaExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }
    @Bean public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    @Bean public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }

    @Bean public Queue userRegisteredQueue() { return new Queue(QUEUE_USER_REGISTERED, true); }
    @Bean public Binding userRegisteredBinding(Queue userRegisteredQueue, TopicExchange skolaExchange) {
        return BindingBuilder.bind(userRegisteredQueue).to(skolaExchange).with("user.registered");
    }

    @Bean public Queue userDeletedQueue() { return new Queue(QUEUE_USER_DELETED, true); }
    @Bean public Binding userDeletedBinding(TopicExchange skolaExchange) {
        return BindingBuilder.bind(userDeletedQueue()).to(skolaExchange).with("user.deleted");
    }

    @Bean public Queue repairCreatedQueue() { return new Queue(QUEUE_REPAIR_CREATED, true); }
    @Bean public Binding repairCreatedBinding(TopicExchange skolaExchange) {
        return BindingBuilder.bind(repairCreatedQueue()).to(skolaExchange).with("repair.created");
    }

    @Bean public Queue repairUpdatedQueue() { return new Queue(QUEUE_REPAIR_UPDATED, true); }
    @Bean public Binding repairUpdatedBinding(TopicExchange skolaExchange) {
        return BindingBuilder.bind(repairUpdatedQueue()).to(skolaExchange).with("repair.updated");
    }

    @Bean public Queue repairDeletedQueue() { return new Queue(QUEUE_REPAIR_DELETED, true); }
    @Bean public Binding repairDeletedBinding(TopicExchange skolaExchange) {
        return BindingBuilder.bind(repairDeletedQueue()).to(skolaExchange).with("repair.deleted");
    }

    @Bean public Queue vehicleCreatedQueue() { return new Queue(QUEUE_VEHICLE_CREATED, true); }
    @Bean public Binding vehicleCreatedBinding(TopicExchange skolaExchange) {
        return BindingBuilder.bind(vehicleCreatedQueue()).to(skolaExchange).with("vehicle.created");
    }

    @Bean public Queue vehicleUpdatedQueue() { return new Queue(QUEUE_VEHICLE_UPDATED, true); }
    @Bean public Binding vehicleUpdatedBinding(TopicExchange skolaExchange) {
        return BindingBuilder.bind(vehicleUpdatedQueue()).to(skolaExchange).with("vehicle.updated");
    }

    @Bean public Queue vehicleDeletedQueue() { return new Queue(QUEUE_VEHICLE_DELETED, true); }
    @Bean public Binding vehicleDeletedBinding(TopicExchange skolaExchange) {
        return BindingBuilder.bind(vehicleDeletedQueue()).to(skolaExchange).with("vehicle.deleted");
    }

    @Bean public Queue instructorAvailabilityQueue() { return new Queue(QUEUE_INSTRUCTOR_AVAILABILITY, true); }
    @Bean public Binding instructorAvailabilityBinding(TopicExchange skolaExchange) {
        return BindingBuilder.bind(instructorAvailabilityQueue()).to(skolaExchange).with("instructor.availability.updated");
    }

    @Bean public Queue vehicleAssignedQueue() { return new Queue(QUEUE_VEHICLE_ASSIGNED, true); }
    @Bean public Binding vehicleAssignedBinding(TopicExchange skolaExchange) {
        return BindingBuilder.bind(vehicleAssignedQueue()).to(skolaExchange).with("instructor.vehicle.assigned");
    }
}