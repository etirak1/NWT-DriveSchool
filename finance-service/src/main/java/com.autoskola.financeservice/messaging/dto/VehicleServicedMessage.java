package com.autoskola.financeservice.messaging.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

public class VehicleServicedMessage implements Serializable {
    private Integer    vehicleId;
    private String     vehiclePlate;
    private BigDecimal repairCost;
    private LocalDate  serviceDate;

    public VehicleServicedMessage() {}

    public Integer getVehicleId()      { return vehicleId; }
    public void setVehicleId(Integer vehicleId)        { this.vehicleId = vehicleId; }
    public String getVehiclePlate()    { return vehiclePlate; }
    public void setVehiclePlate(String vehiclePlate)   { this.vehiclePlate = vehiclePlate; }
    public BigDecimal getRepairCost()  { return repairCost; }
    public void setRepairCost(BigDecimal repairCost)   { this.repairCost = repairCost; }
    public LocalDate getServiceDate()  { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate)  { this.serviceDate = serviceDate; }
}